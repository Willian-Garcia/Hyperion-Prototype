# app/routes/output_routes.py

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pyproj import Transformer
import os
import rasterio

router = APIRouter()

@router.get("/processed-list/")
def listar_processados():
    pasta = "output/"
    try:
        arquivos = [f for f in os.listdir(pasta) if f.endswith("_classes.tif")]
        return JSONResponse(content={"arquivos": arquivos})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bbox-from-tif/")
def bbox_from_tif(filename: str = Query(...)):
    try:
        json_filename = filename.replace("_classes.tif", ".json")
        caminho = os.path.join("output", filename)
        if not os.path.exists(caminho):
            raise HTTPException(status_code=404, detail="Arquivo não encontrado.")

        with rasterio.open(caminho) as src:
            transform = src.transform
            width = src.width
            height = src.height

            # Cálculo direto com transform
            lon_min, lat_max = transform * (0, 0)
            lon_max, lat_min = transform * (width, height)

            # Reprojetar se necessário
            src_crs = src.crs
            if src_crs != "EPSG:4326":
                transformer = Transformer.from_crs(src_crs, "EPSG:4326", always_xy=True)
                lon_min, lat_min = transformer.transform(lon_min, lat_min)
                lon_max, lat_max = transformer.transform(lon_max, lat_max)

        return {"bbox": [lon_min, lat_min, lon_max, lat_max]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
