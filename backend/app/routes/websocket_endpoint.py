from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.utils.websocket_manager import websocket_manager

router = APIRouter()

@router.websocket("/ws/{id}")
async def websocket_endpoint(websocket: WebSocket, id: str):
    try:
        await websocket_manager.connect(id, websocket)
        print(f"🔗 WebSocket conectado para {id}")
        while True:
            await websocket.receive_text()  # Mantém vivo
    except WebSocketDisconnect:
        print(f"❌ WebSocket desconectado: {id}")
        await websocket_manager.disconnect(id)
    except Exception as e:
        print(f"⚠️ Erro inesperado no WebSocket de {id}: {e}")
        await websocket_manager.disconnect(id)
