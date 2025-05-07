from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base  # Usa a Base configurada no database.py

# Definir a tabela de usuários
class Usuario(Base):
    __tablename__ = 'usuarios'
    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)
    admin = Column(Boolean, default=False)

    def __repr__(self):
        return f'Usuario(id_usuario={self.id_usuario}, nome={self.nome}, email={self.email})'