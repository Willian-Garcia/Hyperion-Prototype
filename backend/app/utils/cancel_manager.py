from typing import Dict
from asyncio import Event

class CancelManager:
    def __init__(self):
        self._event_map: Dict[str, Event] = {}

    def iniciar(self, imagem_id: str):
        """Cria um evento para a imagem."""
        self._event_map[imagem_id] = Event()

    def cancelar(self, imagem_id: str):
        """Aciona o cancelamento da imagem."""
        if imagem_id in self._event_map:
            self._event_map[imagem_id].set()

    def is_cancelado(self, imagem_id: str) -> bool:
        """Verifica se o cancelamento foi acionado."""
        evento = self._event_map.get(imagem_id)
        return evento.is_set() if evento else False

    def get_evento(self, imagem_id: str) -> Event:
        """Recupera (ou cria) o Event da imagem."""
        return self._event_map.setdefault(imagem_id, Event())

    def limpar(self, imagem_id: str):
        """Remove o evento após o fim do processamento."""
        self._event_map.pop(imagem_id, None)
