from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from app.schemas.ml_request_schema import MLProcessRequest
from app.services.ml_pipeline import processar_imagem_completa
from app.utils.cancel_instance import cancel_manager
from app.utils.progresso_manager import progresso_manager

router = APIRouter()

@router.post("/processar-imagem")
async def processar_imagem(data: MLProcessRequest, background_tasks: BackgroundTasks):
    print("🔍 Início do processamento de imagem")
    cancel_manager.iniciar(data.id)
    cancel_event = cancel_manager.get_evento(data.id)

    def tarefa():
        import asyncio
        try:
            asyncio.run(processar_imagem_completa(data, cancel=cancel_event))
        except Exception as e:
            print(f"⚠️ Erro durante processamento: {e}")
        finally:
            cancel_manager.limpar(data.id)

    background_tasks.add_task(tarefa)

    return {"status": "processamento iniciado"}

@router.post("/cancelar-processamento")
async def cancelar_processamento(id: str = Query(...)):
    print(f"🚨 Requisição para cancelar: {id}")
    cancel_manager.cancelar(id)
    print("✅ Cancelamento registrado no backend.")
    return {"status": "cancelado"}

@router.get("/status-processamento/{id}")
async def status_processamento(id: str):
    progresso = progresso_manager.get_progresso(id)
    return {"progresso": progresso}

@router.post("/cancelar-processamento-test")
def cancelar_fixo():
    print("🚨 Rota fixa de cancelamento acionada")
    return {"status": "ok"}

@router.get("/ping")
def ping():
    print("🔔 Backend respondeu ao ping")
    return {"status": "ok"}