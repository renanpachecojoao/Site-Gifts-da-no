"""Conexão compartilhada com o MongoDB — importe `client`/`db` daqui (server.py, rotas, seed.py)."""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel

load_dotenv(Path(__file__).parent.parent / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

logger = logging.getLogger(__name__)

# Índices por coleção: todo campo usado para filtrar, ordenar ou evitar duplicados. Aplicados por ensure_indexes() ao iniciar.
INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [IndexModel([("timestamp", DESCENDING)], name="timestamp_desc")],
    "products": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("slug", ASCENDING)], name="slug", unique=True),
        IndexModel([("categories", ASCENDING)], name="categories"),
        IndexModel([("sold", DESCENDING)], name="sold_desc"),
    ],
    "categories": [IndexModel([("slug", ASCENDING)], name="slug", unique=True)],
    "reviews": [IndexModel([("product_id", ASCENDING), ("created_at", DESCENDING)], name="product_created")],
    "orders": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
    ],
    "users": [
        IndexModel([("email", ASCENDING)], name="email", unique=True),
        IndexModel([("user_id", ASCENDING)], name="user_id", unique=True),
    ],
    "sessions": [
        IndexModel([("token_hash", ASCENDING)], name="token_hash", unique=True),
        IndexModel([("expires_at", ASCENDING)], name="expires_ttl", expireAfterSeconds=0),
    ],
    "newsletter": [IndexModel([("email", ASCENDING)], name="email", unique=True)],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # um por vez, assim um índice com erro não impede os outros
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # nunca travar a inicialização por causa de índice; o log mostra o que corrigir
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)
