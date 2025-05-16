from asyncio import Event

class CancelManager:
    def __init__(self):
        self._event = Event()

    def cancel(self):
        """Aciona o evento de cancelamento."""
        self._event.set()

    def is_cancelled(self) -> bool:
        """Verifica se o cancelamento foi acionado."""
        return self._event.is_set()

    async def wait(self):
        """Permite que outros processos aguardem até o cancelamento ser acionado."""
        await self._event.wait()
