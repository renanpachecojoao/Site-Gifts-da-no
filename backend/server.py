# Ponto de entrada da API (FastAPI).
# - Cria o app e o roteador principal com prefixo /api.
# - Inclui os módulos de rotas: auth (login Google), catalog (produtos/categorias/avaliações),
#   checkout (cotação do carrinho e pedidos) e misc (newsletter, contato, upload de artes).
# - IMPORTANTE: app.include_router(api_router) precisa ficar no final, depois de todas as rotas.
# - Configura CORS (origens vindas do .env) e o log.
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Conexão com o MongoDB (cliente compartilhado em lib/db.py)
from lib.db import client, db, ensure_indexes


# Ciclo de vida da API: o que vem antes do yield roda ao iniciar; o que vem depois, ao desligar.
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())  # em segundo plano: criar índices não pode travar a inicialização
    yield
    client.close()


# Cria o app principal (sem prefixo)
app = FastAPI(lifespan=lifespan)

# Cria o roteador com prefixo /api (todas as rotas ficam aqui)
api_router = APIRouter(prefix="/api")


# Modelos de exemplo do modelo inicial (verificação de status da API)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# As rotas são registradas no roteador, nunca direto no app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

from routers import auth as auth_routes, catalog, checkout, misc  # noqa: E402

api_router.include_router(auth_routes.router)
api_router.include_router(catalog.router)
api_router.include_router(checkout.router)
api_router.include_router(misc.router)

# Inclui o roteador no app principal (deve ser a última inclusão de rotas)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração de logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
