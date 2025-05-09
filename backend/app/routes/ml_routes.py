from fastapi import APIRouter, HTTPException
from app.schemas.ml_request_schema import MLProcessRequest
from app.services.ml_pipeline import processar_imagem_completa
import traceback

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
    try:
        resultado = await processar_imagem_completa(data)
        return resultado
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro no processamento: {str(e)}")


#Este novo arquivo substitui e funde os seguintes arquivos do primeiro repositório:

#Arquivo original 
# Parte de main.py (v1) → /processar-imagem/
#   Separado corretamente
#   Agora está modular em routes/ml_routes.py

#Arquivo original 
# MLProcessRequest de schemas/ml_request_schema.py
#   Reutilizado
#   Continua em uso sem alterações