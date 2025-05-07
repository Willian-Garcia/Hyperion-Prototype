from fastapi import APIRouter, Body
from typing import List, Dict, Optional
import os
from fastapi.responses import FileResponse
from app.schemas.stac_api_schema import STACRequest, ColecaoSTAC, STACImagemFiltrada
from app.controllers.stac_api_controller import buscar_imagens, listar_colecoes
from app.utils.download_utils import baixar_e_compactar_bandas

router = APIRouter()

@router.post("/buscar-imagens")
async def buscar(params: STACRequest):
    """
    Rota para buscar imagens e persistir as consultas no banco de dados.
    """
    return await buscar_imagens(params)



@router.get("/colecoes-suportadas", response_model=List[ColecaoSTAC])
def colecoes():
    return listar_colecoes()

@router.post("/baixar-imagens", response_model=List[STACImagemFiltrada])
def baixar_imagens_endpoint(
    id: str = Body(...),
    bandas: Dict[str, str] = Body(...),
    cmask: Optional[str] = Body(None),
    thumbnail: Optional[str] = Body(None)
):
    zip_path = baixar_e_compactar_bandas(id, bandas, cmask, thumbnail)
    return FileResponse(zip_path, filename=os.path.basename(zip_path), media_type="application/zip")