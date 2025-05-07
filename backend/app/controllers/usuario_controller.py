from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from app.models.usuario_model import Usuario
from app.core.database import SessionLocal

class UsuarioController:
    def __init__(self):
        self.session: AsyncSession = SessionLocal()

    async def criar_usuario(self, nome, email, senha, admin=False):
        usuario = Usuario(nome=nome, email=email, senha=senha, admin=admin)
        async with self.session as session:
            async with session.begin():
                session.add(usuario)
        return usuario

    async def buscar_usuarios(self):
        async with self.session as session:
            async with session.begin():
                result = await session.execute(select(Usuario))
                usuarios = result.scalars().all()
        return usuarios

    async def buscar_usuario_por_id(self, id_usuario):
        async with self.session as session:
            async with session.begin():
                result = await session.execute(select(Usuario).where(Usuario.id_usuario == id_usuario))
                try:
                    usuario = result.scalar_one()
                except NoResultFound:
                    usuario = None
        return usuario

    async def atualizar_usuario(self, id_usuario, nome, email, senha, admin):
        async with self.session as session:
            async with session.begin():
                result = await session.execute(select(Usuario).where(Usuario.id_usuario == id_usuario))
                try:
                    usuario = result.scalar_one()
                    usuario.nome = nome
                    usuario.email = email
                    usuario.senha = senha
                    usuario.admin = admin
                    await session.commit()
                except NoResultFound:
                    usuario = None
        return usuario

    async def deletar_usuario(self, id_usuario):
        async with self.session as session:
            async with session.begin():
                result = await session.execute(select(Usuario).where(Usuario.id_usuario == id_usuario))
                try:
                    usuario = result.scalar_one()
                    await session.delete(usuario)
                    await session.commit()
                except NoResultFound:
                    usuario = None
        return usuario