from uvicorn.protocols.http.httptools_impl import HttpToolsProtocol
from uvicorn.config import Config

IGNORED_PATHS = ["/status-processamento", "/processed-list"]

class CustomHttpProtocol(HttpToolsProtocol):
    def get_path(self) -> str:
        return self.scope.get("path", "")

    def log_access(self, request_line: str, status_code: int, headers: list[tuple[bytes, bytes]]) -> None:
        path = self.get_path()
        if any(path.startswith(prefix) for prefix in IGNORED_PATHS):
            return  # Não loga
        super().log_access(request_line, status_code, headers)
