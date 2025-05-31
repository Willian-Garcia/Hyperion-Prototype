from typing import Dict
from threading import Lock

class ProgressoManager:
    def __init__(self):
        self._dados: Dict[str, float] = {}
        self._lock = Lock()

    def set_progresso(self, id: str, progresso: float):
        with self._lock:
            self._dados[id] = progresso

    def get_progresso(self, id: str) -> float:
        with self._lock:
            return self._dados.get(id, 0.0)

    def reset_progresso(self, id: str):
        with self._lock:
            if id in self._dados:
                del self._dados[id]

    def limpar(self, id: str):
        with self._lock:
            if id in self._dados:
                del self._dados[id]

# Instância global para ser usada em todo o app
progresso_manager = ProgressoManager()