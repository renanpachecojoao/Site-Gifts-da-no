# Rotas auxiliares.
# - POST /api/newsletter     -> cadastra e-mail na newsletter (sem duplicar).
# - POST /api/contact        -> salva mensagem do formulário de contato.
# - POST /api/uploads        -> recebe a arte do cliente em base64 (PNG/JPG/WEBP, até 5 MB),
#                               salva em backend/uploads e devolve a URL.
# - GET  /api/uploads/{fid}  -> devolve o arquivo enviado (nome validado para segurança).
import base64
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from lib.db import db
from models.shop import ContactIn, Message, NewsletterIn, UploadIn, UploadOut, now_utc

router = APIRouter()

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_BYTES = 5 * 1024 * 1024
EXT = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp"}


@router.post("/newsletter", response_model=Message, status_code=201)
async def subscribe(body: NewsletterIn):
    email = body.email.lower()
    await db.newsletter.update_one(
        {"email": email}, {"$setOnInsert": {"email": email, "created_at": now_utc()}}, upsert=True
    )
    return Message(message="Inscrição confirmada! Use o cupom AFETO10 na sua primeira compra.")


@router.post("/contact", response_model=Message, status_code=201)
async def contact(body: ContactIn):
    await db.contact_messages.insert_one({**body.model_dump(), "created_at": now_utc()})
    return Message(message="Mensagem enviada! Respondemos em até 1 dia útil.")


@router.post("/uploads", response_model=UploadOut, status_code=201)
async def upload(body: UploadIn):
    m = re.match(r"^data:(image/(?:png|jpeg|webp));base64,(.+)$", body.data_url, re.S)
    if not m:
        raise HTTPException(status_code=400, detail="Envie uma imagem PNG, JPG ou WEBP")
    try:
        raw = base64.b64decode(m.group(2), validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="Arquivo inválido")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Imagem acima de 5 MB")
    fid = f"{uuid.uuid4().hex}.{EXT[m.group(1)]}"
    (UPLOAD_DIR / fid).write_bytes(raw)
    return UploadOut(id=fid, url=f"/api/uploads/{fid}")


@router.get("/uploads/{fid}")
async def get_upload(fid: str):
    if not re.fullmatch(r"[a-f0-9]{32}\.(png|jpg|webp)", fid):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    path = UPLOAD_DIR / fid
    if not path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return FileResponse(path)
