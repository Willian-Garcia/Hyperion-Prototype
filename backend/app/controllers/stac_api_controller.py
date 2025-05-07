from app.schemas.stac_api_schema import STACRequest
from app.services.stac_service import buscar_imagens_stac, listar_colecoes_suportadas
from app.controllers.consulta import persistir_consulta

async def buscar_imagens(params: STACRequest):
    resultados = buscar_imagens_stac(params)

    for resultado in resultados:
        await persistir_consulta(resultado)
        # 👇 Corrige a serialização da data
        resultado["data"] = resultado["data"].isoformat() if resultado["data"] else None

    return {
        "message": "Consultas persistidas com sucesso",
        "total": len(resultados),
        "dados": resultados
    }


def listar_colecoes():
    return listar_colecoes_suportadas()