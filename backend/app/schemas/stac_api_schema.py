from pydantic import BaseModel
from typing import List, Optional

class STACRequest(BaseModel):
    bbox: str
    data_inicio: str
    data_fim: str
    colecao: str
    filtrar_nuvens: Optional[bool] = False
    limite: Optional[int] = 100

class STACImagemFiltrada(BaseModel):
    id: str
    bbox: List[float]
    data_inicio: str
    data_fim: str
    url_imagem: str
    url_cmask: Optional[str]

class ColecaoSTAC(BaseModel):
    id: str
    descricao: str = ""
