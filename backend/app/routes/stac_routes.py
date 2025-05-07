from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.utils.download_utils import baixar_e_compactar_bandas
from app.schemas.download_schema import DownloadRequest

router = APIRouter()

# ✅ Endpoint oficial de download (POST) - usado pelo frontend ou ThunderClient
@router.post("/baixar")
def baixar_arquivo_stac(info: DownloadRequest):
    # Chamando a função que faz o download e cria o arquivo zip
    zip_path = baixar_e_compactar_bandas(
        id=info.id,
        bandas=info.bandas,
        cmask=info.cmask,
        thumbnail=info.thumbnail
    )
    
    # Retornando o arquivo zip como resposta
    return FileResponse(zip_path, filename=f"{info.id}.zip", media_type="application/zip")

# 🧪 Endpoint de teste (GET) - acessável direto no navegador
@router.get("/baixar-teste")
def baixar_teste():
    #id = "CBERS_4A_WFI_20230801_219_124"
    #bandas = {
        #"BAND13": "https://data.inpe.br/bdc/data/cbers4a_wfi/2023_08/CBERS_4A_WFI_RAW_2023_08_01.14_19_30_ETC2/219_124_0/4_BC_UTM_WGS84/CBERS_4A_WFI_20230801_219_124_L4_BAND13_GRID_SURFACE.tif",
        #"BAND14": "https://data.inpe.br/bdc/data/cbers4a_wfi/2023_08/CBERS_4A_WFI_RAW_2023_08_01.14_19_30_ETC2/219_124_0/4_BC_UTM_WGS84/CBERS_4A_WFI_20230801_219_124_L4_BAND14_GRID_SURFACE.tif",
        #"BAND15": "https://data.inpe.br/bdc/data/cbers4a_wfi/2023_08/CBERS_4A_WFI_RAW_2023_08_01.14_19_30_ETC2/219_124_0/4_BC_UTM_WGS84/CBERS_4A_WFI_20230801_219_124_L4_BAND15_GRID_SURFACE.tif",
        #"BAND16": "https://data.inpe.br/bdc/data/cbers4a_wfi/2023_08/CBERS_4A_WFI_RAW_2023_08_01.14_19_30_ETC2/219_124_0/4_BC_UTM_WGS84/CBERS_4A_WFI_20230801_219_124_L4_BAND16_GRID_SURFACE.tif"
    #}
    #cmask = "https://data.inpe.br/bdc/data/cbers4a_wfi/2023_08/CBERS_4A_WFI_RAW_2023_08_01.14_19_30_ETC2/219_124_0/4_BC_UTM_WGS84/CBERS_4A_WFI_20230801_219_124_L4_CMASK_GRID_SURFACE.tif"
    #thumbnail = "https://data.inpe.br/bdc/data/cbers4a_wfi/2023_08/CBERS_4A_WFI_RAW_2023_08_01.14_19_30_ETC2/219_124_0/4_BC_UTM_WGS84/CBERS_4A_WFI_20230801_219_124.png"

    id = "CBERS_4A_WFI_20240830_202_140"
    bandas = {}
    cmask = None
    thumbnail = "https://data.inpe.br/bdc/data/cbers4a_wfi/2024_08/CBERS_4A_WFI_RAW_2024_08_30.13_18_33_ETC2/202_140_0/4_BC_UTM_WGS84/CBERS_4A_WFI_20240830_202_140.png"

    zip_path = baixar_e_compactar_bandas(id=id, bandas=bandas, cmask=cmask, thumbnail=thumbnail)

    return FileResponse(zip_path, filename=f"{id}.zip", media_type="application/zip")
