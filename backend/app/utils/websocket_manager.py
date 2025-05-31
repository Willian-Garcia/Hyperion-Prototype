from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
from asyncio import Lock

class WebSocketManager:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}
        self.locks: Dict[str, Lock] = {}

    async def connect(self, id: str, websocket: WebSocket):
        if id in self.connections:
            await self.disconnect(id)  # Garante que conexão antiga seja fechada
        await websocket.accept()
        self.connections[id] = websocket
        self.locks[id] = Lock()
        print(f"🔌 WebSocket conectado para {id}")

    async def disconnect(self, id: str):
        websocket = self.connections.get(id)
        if websocket:
            try:
                await websocket.close()
            except Exception as e:
                print(f"⚠️ Erro ao fechar WebSocket de {id}: {e}")
            print(f"❎ WebSocket desconectado para {id}")
            self.connections.pop(id, None)
            self.locks.pop(id, None)

    async def send_progress(self, id: str, progresso: float):
        websocket = self.connections.get(id)
        lock = self.locks.get(id)
        if websocket and lock:
            async with lock:
                try:
                    await websocket.send_json({"progresso": progresso})
                    print(f"📡 Enviado progresso {progresso:.2%} para {id}")
                except WebSocketDisconnect:
                    print(f"🔌 WebSocket de {id} foi desconectado.")
                    await self.disconnect(id)
                except Exception as e:
                    print(f"❌ Erro ao enviar progresso para {id}: {e}")
                    await self.disconnect(id)
        else:
            print(f"⚠️ Nenhum websocket ativo para {id}. Progresso não enviado.")

websocket_manager = WebSocketManager()
