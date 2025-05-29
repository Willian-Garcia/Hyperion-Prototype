from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import logging

class SilentRoutesMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, silent_prefixes: list[str]):
        super().__init__(app)
        self.silent_prefixes = silent_prefixes

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if any(path.startswith(prefix) for prefix in self.silent_prefixes):
            # Reduz o nível do logger apenas durante essa requisição
            access_logger = logging.getLogger("uvicorn.access")
            previous_level = access_logger.level
            access_logger.setLevel(logging.WARNING)

            try:
                response = await call_next(request)
            finally:
                access_logger.setLevel(previous_level)  # Restaura o nível anterior
            return response

        return await call_next(request)
