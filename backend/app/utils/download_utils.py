from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import requests
import zipfile
from asyncio import Event 

router = APIRouter()

# Modelo para requisição de download
class DownloadRequest(BaseModel):
    id: str
    bandas: dict
    cmask: str = None
    thumbnail: str = None

# Função para checar disponibilidade antes de baixar
def checar_disponibilidade(url: str, timeout=10) -> bool:
    try:
        resposta = requests.head(url, timeout=timeout)
        return resposta.status_code == 200
    except requests.RequestException as e:
        print(f"⚠️ Erro ao verificar URL {url}: {e}")
        return False


# Função para baixar o arquivo
def baixar_arquivo(url, caminho_destino, cancel: Event = None):
    if not checar_disponibilidade(url):
        raise Exception(f"URL indisponível ou não encontrada: {url}")

    try:
        print(f"⬇️ Baixando: {url} → {caminho_destino}")
        resposta = requests.get(url, timeout=60, stream=True)
        resposta.raise_for_status()

        os.makedirs(os.path.dirname(caminho_destino), exist_ok=True)
        with open(caminho_destino, 'wb') as f:
            for chunk in resposta.iter_content(chunk_size=8192):
                if cancel and cancel.is_set():
                    print("🛑 Cancelado durante download")
                    raise Exception("Download cancelado pelo usuário")

                if chunk:
                    f.write(chunk)

        print(f"✅ Arquivo salvo em: {caminho_destino}")
    except requests.RequestException as e:
        print(f"❌ Falha ao baixar {url}: {e}")
        raise


# Função para baixar e compactar as bandas
def baixar_e_compactar_bandas(id: str, bandas: dict, cmask: str, thumbnail: str, cancel: Event = None):
    # Criando um diretório temporário para armazenar as bandas baixadas
    temp_dir = f"temp/{id}"
    os.makedirs(temp_dir, exist_ok=True)

    try:
        # Baixando cada banda
        for banda, url in bandas.items():
            if cancel and cancel.is_set():
                raise Exception("Cancelado durante download das bandas")
            caminho_banda = os.path.join(temp_dir, f"{banda}.tif")
            baixar_arquivo(url, caminho_banda, cancel)

        # Baixando o CMASK, se existir
        if cmask:
            if cancel and cancel.is_set():
                raise Exception("Cancelado durante download do CMASK")
            caminho_cmask = os.path.join(temp_dir, "cmask.tif")
            baixar_arquivo(cmask, caminho_cmask, cancel)

        # Baixando a thumbnail, se existir
        if thumbnail:
            if cancel and cancel.is_set():
                raise Exception("Cancelado durante download da thumbnail")
            caminho_thumbnail = os.path.join(temp_dir, "thumbnail.png")
            baixar_arquivo(thumbnail, caminho_thumbnail, cancel)

        # Compactando os arquivos em um ZIP
        zip_path = f"temp/{id}.zip"
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, _, files in os.walk(temp_dir):
                for file in files:
                    zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), temp_dir))

        return zip_path

    finally:
        # Deletando o diretório temporário após compactar ou em caso de erro
        for root, _, files in os.walk(temp_dir, topdown=False):
            for file in files:
                os.remove(os.path.join(root, file))
            os.rmdir(root)
