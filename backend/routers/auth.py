"""Emergent-managed Google login → own opaque session in Mongo, delivered as an httpOnly cookie."""

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Request, Response

from lib.db import db
from models.shop import GoogleExchange, User

router = APIRouter(prefix="/auth")

COOKIE = "gn_session"
TTL = timedelta(days=30)
SESSION_URL = os.environ.get(
    "EMERGENT_SESSION_URL", "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _digest(v: str) -> str:
    return hashlib.sha256(v.encode()).hexdigest()


def _public(doc: dict) -> User:
    return User(id=doc["user_id"], email=doc["email"], name=doc.get("name"), picture=doc.get("picture"))


async def optional_user(request: Request) -> Optional[dict]:
    token = request.cookies.get(COOKIE)
    if not token:
        return None
    session = await db.sessions.find_one({"token_hash": _digest(token)})
    if not session:
        return None
    expires = session["expires_at"]
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires <= _now():
        return None
    return await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})


async def require_user(request: Request) -> dict:
    user = await optional_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Não autenticado")
    return user


@router.post("/google/exchange", response_model=User)
async def exchange(body: GoogleExchange, response: Response):
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(SESSION_URL, headers={"X-Session-ID": body.session_id})
        if r.status_code != 200:
            raise ValueError("rejected")
        profile = r.json()
    except (httpx.HTTPError, ValueError):
        raise HTTPException(status_code=401, detail="Sessão Google inválida ou expirada")

    email = (profile.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=401, detail="Perfil Google sem e-mail")
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user is None:
        user = {
            "user_id": secrets.token_urlsafe(18),
            "email": email,
            "name": profile.get("name"),
            "picture": profile.get("picture"),
            "created_at": _now(),
        }
        await db.users.insert_one(dict(user))
    else:
        await db.users.update_one(
            {"email": email}, {"$set": {"name": profile.get("name"), "picture": profile.get("picture")}}
        )
        user.update(name=profile.get("name"), picture=profile.get("picture"))

    raw = secrets.token_urlsafe(32)
    await db.sessions.insert_one(
        {"token_hash": _digest(raw), "user_id": user["user_id"], "expires_at": _now() + TTL, "created_at": _now()}
    )
    response.set_cookie(
        COOKIE, raw, max_age=int(TTL.total_seconds()), httponly=True, secure=True, samesite="lax", path="/"
    )
    return _public(user)


@router.get("/me", response_model=Optional[User])
async def me(request: Request):
    """Who am I — `null` for anonymous visitors (avoids a 401 on every page load)."""
    user = await optional_user(request)
    return _public(user) if user else None


@router.post("/logout", status_code=204)
async def logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE)
    if token:
        await db.sessions.delete_one({"token_hash": _digest(token)})
    response.delete_cookie(COOKIE, path="/")
