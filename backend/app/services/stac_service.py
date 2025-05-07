import requests
from pystac_client import Client
from app.schemas.stac_api_schema import STACRequest
from datetime import datetime  # <- Adicionado

STAC_BASE_URL = "https://data.inpe.br/bdc/stac/v1"
WFI_KEYWORDS = ["WFI", "wfi", "WFM", "wfm"]

def buscar_imagens_stac(params: STACRequest):
    bbox = list(map(float, params.bbox.split(",")))

    client = Client.open(STAC_BASE_URL)

    search = client.search(
        collections=[params.colecao],
        bbox=bbox,
        datetime=f"{params.data_inicio}/{params.data_fim}",
        limit=100
    )

    items = search.items()
    resultados = []

    for item in items:
        propriedades = item.properties
        cloud_cover = propriedades.get("eo:cloud_cover")

        # Aplica o filtro SOMENTE se for solicitado
        if params.filtrar_nuvens and (cloud_cover is None or cloud_cover > 10):
            continue

        assets = item.assets
        band13 = assets.get("BAND13")
        band14 = assets.get("BAND14")
        band15 = assets.get("BAND15")
        band16 = assets.get("BAND16")
        cmask = assets.get("CMASK")
        thumbnail = assets.get("thumbnail")

        # Converte string para datetime.date
        data_str = propriedades.get("datetime", "")[:10]
        data_formatada = datetime.strptime(data_str, "%Y-%m-%d").date() if data_str else None

        resultados.append({
            "id": item.id,
            "data": data_formatada,
            "bbox": item.bbox,
            "bandas": {
                "BAND13": band13.href if band13 else None,
                "BAND14": band14.href if band14 else None,
                "BAND15": band15.href if band15 else None,
                "BAND16": band16.href if band16 else None,
            },
            "cmask": cmask.href if cmask else None,
            "thumbnail": thumbnail.href if thumbnail else None,
            "cobertura_nuvem": cloud_cover,
        })

    return resultados

_cached_colecoes = None

def listar_colecoes_suportadas():
    global _cached_colecoes

    if _cached_colecoes is not None:
        return _cached_colecoes

    try:
        res = requests.get(f"{STAC_BASE_URL}/collections", timeout=10)
        res.raise_for_status()
        todas = res.json().get("collections", [])

        filtradas = [
            {
                "id": c["id"],
                "descricao": c.get("description", "")
            }
            for c in todas
            if any(k.lower() in c["id"].replace("-", "_").lower() for k in WFI_KEYWORDS)
        ]

        _cached_colecoes = filtradas  # salva o cache
        return filtradas
    except Exception as e:
        return []
