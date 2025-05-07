from pydantic import BaseModel
from typing import Optional, List

class MLProcessRequest(BaseModel):
    id: str
    band15_url: str
    band16_url: str
    bbox: List[float]  # [lon_min, lat_min, lon_max, lat_max]