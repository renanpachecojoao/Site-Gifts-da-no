import random
import re
from typing import Optional

from fastapi import APIRouter, HTTPException, Request

from lib.db import db
from models.shop import (
    CartLine,
    Order,
    OrderCreate,
    OrderLine,
    Quote,
    QuoteRequest,
    ShippingOption,
)
from routers.auth import optional_user, require_user

router = APIRouter()

COUPONS = {
    "AFETO10": {"type": "percent", "value": 10, "min": 0, "label": "10% de desconto aplicado"},
    "BEMVINDA15": {"type": "percent", "value": 15, "min": 150, "label": "15% de desconto aplicado"},
    "FRETEGRATIS": {"type": "shipping", "value": 0, "min": 0, "label": "Frete grátis aplicado"},
}
FREE_SHIPPING_FROM = 299.0


def _shipping_options(cep: str, subtotal: float, free: bool) -> list[ShippingOption]:
    digits = re.sub(r"\D", "", cep)
    if len(digits) != 8:
        raise HTTPException(status_code=400, detail="CEP inválido")
    region = int(digits[0])  # 0-3 Sudeste próximo, 4-7 Centro/Nordeste/Norte, 8-9 Sul
    pac = 18.9 + (0 if region <= 3 else 9 if region >= 8 else 14)
    sedex = pac + 16
    if free or subtotal >= FREE_SHIPPING_FROM:
        pac = 0.0
    base = 4 if region <= 3 else 6 if region >= 8 else 9
    return [
        ShippingOption(id="pac", name="PAC", price=round(pac, 2), days=f"{base} a {base + 3} dias úteis"),
        ShippingOption(id="sedex", name="SEDEX", price=round(sedex, 2), days=f"{max(1, base - 3)} a {base - 1} dias úteis"),
    ]


async def _priced_lines(items: list[CartLine]) -> tuple[list[dict], float]:
    if not items:
        raise HTTPException(status_code=400, detail="Carrinho vazio")
    ids = list({i.product_id for i in items})
    docs = {d["id"]: d for d in await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(len(ids))}
    lines, subtotal = [], 0.0
    for i in items:
        doc = docs.get(i.product_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Produto do carrinho não encontrado")
        price = doc.get("promo_price") or doc["price"]
        subtotal += price * i.quantity
        lines.append({"doc": doc, "price": price})
    return lines, round(subtotal, 2)


async def _quote(items: list[CartLine], coupon: Optional[str], cep: Optional[str], method: Optional[str]) -> Quote:
    _, subtotal = await _priced_lines(items)
    discount, valid, msg, free = 0.0, False, "", False
    code = (coupon or "").strip().upper() or None
    if code:
        c = COUPONS.get(code)
        if not c:
            msg = "Cupom inválido ou expirado"
        elif subtotal < c["min"]:
            msg = f"Válido para compras acima de R$ {c['min']:.2f}".replace(".", ",")
        else:
            valid, msg = True, c["label"]
            if c["type"] == "percent":
                discount = round(subtotal * c["value"] / 100, 2)
            else:
                free = True
    options = _shipping_options(cep, subtotal - discount, free) if cep else []
    chosen = next((o for o in options if o.id == method), options[0] if options else None)
    shipping = chosen.price if chosen else 0.0
    return Quote(
        subtotal=subtotal,
        discount=discount,
        coupon=code if valid else None,
        coupon_valid=valid,
        coupon_message=msg,
        shipping_options=options,
        shipping=shipping,
        shipping_method=chosen.id if chosen else None,
        total=round(subtotal - discount + shipping, 2),
    )


@router.post("/cart/quote", response_model=Quote)
async def cart_quote(body: QuoteRequest):
    return await _quote(body.items, body.coupon, body.cep, body.shipping_method)


@router.post("/orders", response_model=Order, status_code=201)
async def create_order(body: OrderCreate, request: Request):
    user = await optional_user(request)
    lines, _ = await _priced_lines([CartLine(product_id=i.product_id, quantity=i.quantity) for i in body.items])
    quote = await _quote(
        [CartLine(product_id=i.product_id, quantity=i.quantity) for i in body.items],
        body.coupon,
        body.address.cep,
        body.shipping_method,
    )
    order_lines = [
        OrderLine(**i.model_dump(), name=l["doc"]["name"], image=l["doc"]["images"][0], unit_price=l["price"])
        for i, l in zip(body.items, lines)
    ]
    total = quote.total
    if body.payment_method == "pix":
        total = round(total * 0.95, 2)  # 5% off no Pix
    number = f"GN{random.randint(100000, 999999)}"
    order = Order(
        number=number,
        user_id=user["user_id"] if user else None,
        customer=body.customer,
        address=body.address,
        items=order_lines,
        subtotal=quote.subtotal,
        discount=round(quote.discount + (quote.total - total), 2),
        shipping=quote.shipping,
        total=total,
        coupon=quote.coupon,
        shipping_method=quote.shipping_method or body.shipping_method,
        payment_method=body.payment_method,
        installments=body.installments if body.payment_method == "credit" else 1,
        status="Aguardando pagamento Pix" if body.payment_method == "pix" else "Pagamento aprovado",
        pix_code=(
            f"00020126580014BR.GOV.BCB.PIX0136giftsdano-{number.lower()}5204000053039865406{total:.2f}5802BR5911GIFTS DA NO6009SAO PAULO6304A1B2"
            if body.payment_method == "pix"
            else None
        ),
    )
    await db.orders.insert_one(order.model_dump())
    for i in body.items:
        await db.products.update_one({"id": i.product_id}, {"$inc": {"stock": -i.quantity, "sold": i.quantity}})
    return order


@router.get("/orders/mine", response_model=list[Order])
async def my_orders(request: Request):
    user = await require_user(request)
    docs = await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [Order(**d) for d in docs]
