import os
import torch
import numpy as np
import rasterio
from rasterio.coords import BoundingBox
from rasterio.windows import from_bounds
from PIL import Image, ImageDraw
from app.utils.download_utils import baixar_arquivo
from app.model import get_unet_model
from app.utils.cancel_manager import CancelManager
import matplotlib.pyplot as plt
import logging

# Cores das classes
COLORS = {
    1: (255, 0, 0, 255),     # Queimada
    2: (124, 94, 21, 255),   # Solo
    3: (16, 149, 9, 255),    # Vegetação
}

def compute_ndvi(red_path, nir_path, output_path, preview_path=None, cancel: CancelManager = None):
    with rasterio.open(red_path) as red, rasterio.open(nir_path) as nir:
        red_bounds = red.bounds
        nir_bounds = nir.bounds

        intersection = BoundingBox(
            left=max(red_bounds.left, nir_bounds.left),
            bottom=max(red_bounds.bottom, nir_bounds.bottom),
            right=min(red_bounds.right, nir_bounds.right),
            top=min(red_bounds.top, nir_bounds.top)
        )

        red_window = from_bounds(*intersection, transform=red.transform)
        nir_window = from_bounds(*intersection, transform=nir.transform)

        red_data = red.read(1, window=red_window).astype("float32")
        nir_data = nir.read(1, window=nir_window).astype("float32")

        if cancel and cancel.is_cancelled():
            logging.warning("🛑 Cancelado durante leitura de dados NDVI")
            raise Exception("Processamento cancelado durante NDVI")

        ndvi = (nir_data - red_data) / (nir_data + red_data + 1e-10)
        ndvi = np.clip(ndvi, -1, 1)

        profile = red.profile
        profile.update(
            dtype="float32",
            count=1,
            height=red_data.shape[0],
            width=red_data.shape[1],
            transform=rasterio.windows.transform(red_window, red.transform)
        )

        with rasterio.open(output_path, "w", **profile) as dst:
            dst.write(ndvi, 1)

        if preview_path:
            save_ndvi_preview(ndvi, preview_path, cancel)

def save_ndvi_preview(ndvi_array, save_path, cancel: CancelManager = None):
    if cancel and cancel.is_cancelled():
        logging.warning("🛑 Cancelado antes de gerar preview NDVI")
        raise Exception("Cancelado antes de salvar visualização NDVI")

    rgb_image = np.zeros((ndvi_array.shape[0], ndvi_array.shape[1], 3), dtype=np.uint8)
    rgb_image[ndvi_array < 0.1] = [0, 0, 128]
    rgb_image[(ndvi_array >= 0.1) & (ndvi_array < 0.2)] = [255, 0, 0]
    rgb_image[(ndvi_array >= 0.2) & (ndvi_array < 0.3)] = [124, 94, 21]
    rgb_image[ndvi_array >= 0.3] = [16, 149, 9]

    plt.figure(figsize=(10, 10))
    plt.imshow(rgb_image)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()

def run_model(ndvi_path, output_prefix, cancel: CancelManager = None):
    tile_size = 256
    stride = 128

    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)

    output_tif = os.path.join(output_dir, f"{output_prefix}_classes.tif")
    output_png = os.path.join(output_dir, f"{output_prefix}_rgb.png")

    with rasterio.open(ndvi_path) as src:
        ndvi_array = src.read(1)
        profile = src.profile.copy()
        ndvi_array = np.nan_to_num(ndvi_array)

    if ndvi_array.min() < 0 or ndvi_array.max() > 1:
        ndvi_array = (ndvi_array + 1) / 2

    h, w = ndvi_array.shape
    predicted_mask = np.zeros((h, w), dtype=np.uint8)
    rgba_image = Image.new("RGBA", (w, h))
    draw = ImageDraw.Draw(rgba_image)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = get_unet_model(num_classes=4).to(device)
    model.load_state_dict(torch.load("models/final_model_1.pth", map_location=device))
    model.eval()

    with torch.no_grad():
        for i in range(0, h, stride):
            for j in range(0, w, stride):
                if cancel and cancel.is_cancelled():
                    logging.warning("🛑 Cancelado durante segmentação U-Net")
                    raise Exception("Processamento cancelado durante segmentação")

                i_end = min(i + tile_size, h)
                j_end = min(j + tile_size, w)

                tile = ndvi_array[i:i_end, j:j_end]
                pad_h = tile_size - tile.shape[0]
                pad_w = tile_size - tile.shape[1]
                tile_padded = np.pad(tile, ((0, pad_h), (0, pad_w)), mode='constant', constant_values=0)

                tile_tensor = torch.tensor(tile_padded, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(device)
                output = model(tile_tensor).squeeze(0).cpu().numpy()
                output = output[:, :tile.shape[0], :tile.shape[1]]

                predicted = np.argmax(output, axis=0).astype(np.uint8)
                predicted_mask[i:i_end, j:j_end] = predicted

                for label, color in COLORS.items():
                    ys, xs = np.where(predicted == label)
                    for y, x in zip(ys, xs):
                        draw.point((j + x, i + y), fill=color)

    profile.pop("nodata", None)
    profile.update(dtype=rasterio.uint8, count=1)
    with rasterio.open(output_tif, "w", **profile) as dst:
        dst.write(predicted_mask, 1)

    rgba_image.save(output_png)
    return output_tif, output_png

async def processar_imagem_completa(data, cancel: CancelManager):
    logging.info(f"🚀 Iniciando processamento para: {data.id}")

    red_path = f"data/raw/{data.id}_BAND15.tif"
    nir_path = f"data/raw/{data.id}_BAND16.tif"
    ndvi_tif = f"data/processed/{data.id}_ndvi.tif"
    ndvi_preview = f"data/processed/{data.id}_ndvi_preview.png"

    if cancel.is_cancelled():
        raise Exception("Processamento cancelado antes de iniciar downloads")

    baixar_arquivo(data.band15_url, red_path)
    if cancel.is_cancelled():
        raise Exception("Cancelado após download BAND15")

    baixar_arquivo(data.band16_url, nir_path)
    if cancel.is_cancelled():
        raise Exception("Cancelado após download BAND16")

    compute_ndvi(red_path, nir_path, ndvi_tif, ndvi_preview, cancel)
    tif_final, png_final = run_model(ndvi_tif, data.id, cancel)

    with rasterio.open(tif_final) as src:
        bounds = src.bounds
        real_bbox = [bounds.left, bounds.bottom, bounds.right, bounds.top]

    logging.info(f"✅ Processamento concluído para: {data.id}")
    return {
        "preview_png": f"/output/{data.id}_rgb.png",
        "preview_tif": f"/output/{data.id}_classes.tif",
        "bbox": data.bbox,
        "bbox_real": real_bbox
    }


#Este novo arquivo substitui e funde os seguintes arquivos do primeiro repositório:

#Arquivo original 
# backend/app/compute_ndvi.py 
#   Incorporado
#   A função compute_ndvi foi migrada e refatorada

#Arquivo original 
# backend/app/run_model.py
#   Incorporado
#   Toda a lógica do U-Net e draw foi fundida

#Arquivo original 
# backend/app/image_machine_learning.py 
#   Fundido
#   A versão mais robusta com tiles sobrepostos foi usada parcialmente

#Arquivo original 
# app/model.py
#   Referenciado
#   Continua sendo importado para carregar o modelo U-Net

#Arquivo original 
# utils/download_utils.py (v1)
#   Substuido
#   Agora usamos a versão mais completa do segundo repositório



 