from fastapi import APIRouter, HTTPException
from app.controllers.usuario_controller import UsuarioController
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
usuario_controller = UsuarioController()

class UsuarioSchema(BaseModel):
    nome: str
    email: str
    senha: str
    admin: bool = False

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    senha: Optional[str] = None
    admin: Optional[bool] = None

    class Config:
        orm_mode = True

class UsuarioResponse(BaseModel):
    id_usuario: int
    nome: str
    email: str
    admin: bool

    class Config:
        orm_mode = True

@router.post("/usuarios/post")
async def criar_usuario(usuario: UsuarioSchema):
    usuario_criado = await usuario_controller.criar_usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha=usuario.senha,
        admin=usuario.admin
    )
    return usuario_criado

@router.get("/usuarios/getall")
async def listar_usuarios():
    usuarios = await usuario_controller.buscar_usuarios()
    return usuarios

@router.get("/usuarios/get/{id_usuario}")
async def buscar_usuario(id_usuario: int):
    usuario = await usuario_controller.buscar_usuario_por_id(id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario

@router.put("/usuarios/put/{id_usuario}", response_model=UsuarioResponse)
async def atualizar_usuario(id_usuario: int, usuario_update: UsuarioUpdate):
    usuario = await usuario_controller.atualizar_usuario(
        id_usuario=id_usuario,
        nome=usuario_update.nome,
        email=usuario_update.email,
        senha=usuario_update.senha,
        admin=usuario_update.admin
    )
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario

@router.delete("/usuarios/delete/{id_usuario}")
async def deletar_usuario(id_usuario: int):
    usuario = await usuario_controller.deletar_usuario(id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"detail": "Usuário deletado com sucesso"}