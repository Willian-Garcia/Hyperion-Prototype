from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.routes.api import router as api_router
from app.routes import stac_routes
from app.routes.usuario_route import router as usuario_router
from app.routes.ml_routes import router as ml_router
from app.routes.output_routes import router as output_router
from app.routes.websocket_endpoint import router as websocket_router
from app.core.database import engine, Base
from app.schemas.tb_consulta import create_tables
from app.middleware.silent_routes_middleware import SilentRoutesMiddleware
from app.utils.cancel_instance import cancel_manager  # ✅ 

app = FastAPI(title="Monitoramento de Queimadas")

# ✅ Middleware para rotas silenciosas (ex: polling)
app.add_middleware(
    SilentRoutesMiddleware,
    silent_prefixes=["/status-processamento", "/processed-list"]
)

# ✅ CORS configurado para permitir acesso do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Para produção, troque para domínios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Tarefas de inicialização (criação do banco e tabelas)
@app.on_event("startup")
async def startup_event():
    logging.info("🚀 Iniciando o backend e criando tabelas...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await create_tables()
    logging.info("✅ Tabelas criadas e serviço pronto!")

# ✅ Rotas principais da aplicação
app.include_router(api_router)
app.include_router(stac_routes.router, prefix="/stac")
app.include_router(usuario_router, prefix="/api/v1")
app.include_router(ml_router)
app.include_router(output_router)
app.include_router(websocket_router)

# ✅ Servindo arquivos estáticos (como imagens processadas)
app.mount("/output", StaticFiles(directory="output"), name="output")

__all__ = ["cancel_manager"]
