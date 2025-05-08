from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes.api import router as api_router
from app.routes import stac_routes
from app.core.database import engine, Base
from app.routes.usuario_route import router as usuario_router
from app.routes.ml_routes import router as ml_router
from app.routes.output_routes import router as output_router
from app.schemas.tb_consulta import create_tables
from fastapi.middleware.cors import CORSMiddleware
import logging

app = FastAPI(title="Monitoramento de Queimadas")

# ✅ Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ou ["*"] para liberar geral em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criação das tabelas no banco de dados durante a inicialização
@app.on_event("startup")
async def startup_event():
    logging.info("Iniciando a criação das tabelas...")
    # Criando as tabelas do banco de dados
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logging.info("Tabelas criadas com sucesso!")

    # Também chama a função para criar as tabelas relacionadas a consultas
    await create_tables()

# Incluindo as rotas no aplicativo FastAPI
app.include_router(api_router)

# Rota STAC
app.include_router(stac_routes.router, prefix="/stac")

# Rota do usuário (API v1)
app.include_router(usuario_router, prefix="/api/v1")

#Rota para /processar-imagem
app.include_router(ml_router)

#Rota para /processed-list e /bbox-from-tif
app.include_router(output_router)

app.mount("/output", StaticFiles(directory="output"), name="output")
