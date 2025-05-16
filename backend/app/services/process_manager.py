from typing import Dict
import threading

# Dicionário global para gerenciar cancelamentos por ID
cancel_flags: Dict[str, threading.Event] = {}

def iniciar_cancelamento(imagem_id: str):
    cancel_flags[imagem_id] = threading.Event()

def verificar_cancelamento(imagem_id: str) -> bool:
    return cancel_flags.get(imagem_id, threading.Event()).is_set()

def cancelar_processamento(imagem_id: str):
    if imagem_id in cancel_flags:
        cancel_flags[imagem_id].set()

def limpar_cancelamento(imagem_id: str):
    cancel_flags.pop(imagem_id, None)