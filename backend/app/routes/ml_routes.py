from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.ml_request_schema import MLProcessRequest
from app.services.ml_pipeline import processar_imagem_completa
from app.utils.cancel_manager import CancelManager

cancel_map = {}  # Dict[str, CancelManager]

router = APIRouter()

@router.post("/processar-imagem")
async def processar_imagem(data: MLProcessRequest):
    """
    Rota que executa o pipeline completo:
    1. Baixa BAND15 e BAND16
    2. Gera NDVI e preview
    3. Executa o modelo U-Net para segmentação
    4. Retorna os caminhos dos arquivos e bbox real
    """
    print("🔍 Início do processamento de imagem")
    try:
        cancel = CancelManager()
        cancel_map[data.id] = cancel

        resultado = await processar_imagem_completa(data, cancel)
        cancel_map.pop(data.id, None)

        return resultado
    except Exception as e:
        import traceback
        traceback.print_exc()
        cancel_map.pop(data.id, None)
        raise HTTPException(status_code=500, detail=f"Erro no processamento: {str(e)}")


@router.post("/cancelar-processamento/{id}")
async def cancelar_processamento(id: str):
    cancel = cancel_map.get(id)
    if cancel:
        cancel.cancel()
        return {"status": "cancelado"}
    else:
        raise HTTPException(status_code=404, detail="Processo não encontrado")


#Este novo arquivo substitui e funde os seguintes arquivos do primeiro repositório:

#Arquivo original 
# Parte de main.py (v1) → /processar-imagem/
#   Separado corretamente
#   Agora está modular em routes/ml_routes.py

#Arquivo original 
# MLProcessRequest de schemas/ml_request_schema.py
#   Reutilizado
#   Continua em uso sem alterações