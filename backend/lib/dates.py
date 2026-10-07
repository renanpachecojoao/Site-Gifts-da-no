"""Funções de data no servidor. O relógio do servidor é UTC — calcule "hoje" aqui, nunca no navegador."""

import os
from datetime import datetime
from zoneinfo import ZoneInfo


def today_iso(tz: str | None = None) -> str:
    """Data de hoje no formato AAAA-MM-DD no fuso `tz` (padrão: variável APP_TZ, senão UTC)."""
    zone = tz or os.environ.get("APP_TZ", "UTC")
    return datetime.now(ZoneInfo(zone)).strftime("%Y-%m-%d")
