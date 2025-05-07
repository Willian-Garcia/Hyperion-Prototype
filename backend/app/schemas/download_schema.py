from pydantic import BaseModel
from typing import Optional, Dict

class DownloadRequest(BaseModel):
    id: str
    bandas: Dict[str, Optional[str]]
    cmask: Optional[str] = None
    thumbnail: Optional[str] = None