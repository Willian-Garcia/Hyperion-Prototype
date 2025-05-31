from fastapi import APIRouter
from pydantic import BaseModel
import os
import requests
import zipfile
from asyncio import Event

router = APIRouter()

class DownloadRequest(BaseModel):
    id: str
    bandas: dict
    cmask: str = None
    thumbnail: str = None

def checar_disponibilidade(url: str, timeout=10) -> bool:
    try:
        resposta = requests.head(url, timeout=timeout)
        return resposta.status_code == 200
    except requests.RequestException as e:
        print(f"⚠️ Erro ao verificar URL {url}: {e}")
        return False

def baixar_arquivo(url: str, caminho_destino: str, cancel: Event = None):
    if cancel and cancel.is_set():
        print("🛑 Cancelado antes de iniciar download")
        raise Exception("Download cancelado pelo usuário")

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
                    print("🛑 Cancelado durante download de arquivo")
                    raise Exception("Download cancelado pelo usuário")
                if chunk:
                    f.write(chunk)

        print(f"✅ Arquivo salvo em: {caminho_destino}")
    except requests.RequestException as e:
        print(f"❌ Falha ao baixar {url}: {e}")
        raise

def baixar_e_compactar_bandas(id: str, bandas: dict, cmask: str, thumbnail: str, cancel: Event = None):
    temp_dir = f"temp/{id}"
    os.makedirs(temp_dir, exist_ok=True)

    try:
        for banda, url in bandas.items():
            if cancel and cancel.is_set():
                raise Exception("🛑 Cancelado durante download das bandas")
            caminho_banda = os.path.join(temp_dir, f"{banda}.tif")
            baixar_arquivo(url, caminho_banda, cancel)

        if cmask:
            if cancel and cancel.is_set():
                raise Exception("🛑 Cancelado durante download do CMASK")
            caminho_cmask = os.path.join(temp_dir, "cmask.tif")
            baixar_arquivo(cmask, caminho_cmask, cancel)

        if thumbnail:
            if cancel and cancel.is_set():
                raise Exception("🛑 Cancelado durante download da thumbnail")
            caminho_thumbnail = os.path.join(temp_dir, "thumbnail.png")
            baixar_arquivo(thumbnail, caminho_thumbnail, cancel)

        zip_path = f"temp/{id}.zip"
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, _, files in os.walk(temp_dir):
                for file in files:
                    zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), temp_dir))

        print(f"🗜️ Arquivos compactados em: {zip_path}")
        return zip_path

    finally:
        print(f"🧹 Limpando diretório temporário: {temp_dir}")
        for root, _, files in os.walk(temp_dir, topdown=False):
            for file in files:
                try:
                    os.remove(os.path.join(root, file))
                except Exception as e:
                    print(f"⚠️ Erro ao remover arquivo {file}: {e}")
            try:
                os.rmdir(root)
            except Exception as e:
                print(f"⚠️ Erro ao remover diretório {root}: {e}")
