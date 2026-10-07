# Modelos de dados (Pydantic) da loja Gifts da No.
# Cada modelo tem um espelho em TypeScript em frontend/src/lib/types.ts — ao alterar aqui, altere lá também.
# - Category: categoria da vitrine (slug, nome, frase curta, imagem, ordem).
# - OptionGroup / Personalization: opções do produto (tamanho, acabamento...) e o que pode ser
#   personalizado (nome, mensagem, upload de arte) com limites de caracteres.
# - Product: produto completo (preço, preço promocional, estoque, SKU, selo, avaliações, materiais...).
# - ReviewCreate / Review: avaliação enviada pelo cliente e a avaliação salva.
# - CartLine / QuoteRequest / Quote / ShippingOption: cálculo do carrinho (subtotal, cupom, frete, total).
# - Customer / Address / OrderLineIn / OrderCreate / OrderLine / Order: dados do checkout e do pedido salvo.
# - NewsletterIn, ContactIn, UploadIn/UploadOut, User, GoogleExchange, Message: demais entradas/saídas.
"""Pydantic models for the Gifts da No store. Mirrored by hand in frontend/src/lib/types.ts."""

import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class Category(BaseModel):
    slug: str
    name: str
    tag: str
    image: str
    order: int = 0


class OptionGroup(BaseModel):
    name: str
    values: list[str]


class Personalization(BaseModel):
    options: list[OptionGroup] = []
    allow_name: bool = False
    allow_message: bool = False
    allow_upload: bool = False
    name_max: int = 20
    message_max: int = 120


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    short_description: str
    description: str
    price: float
    promo_price: Optional[float] = None
    categories: list[str]
    images: list[str]
    stock: int
    sku: str
    badge: Optional[Literal["Mais vendido", "Novo", "Oferta"]] = None
    rating: float = 0
    reviews_count: int = 0
    personalization: Personalization = Personalization()
    materials: str = ""
    dimensions: str = ""
    care: str = ""
    production_time: str = ""
    sold: int = 0
    created_at: datetime = Field(default_factory=now_utc)


class ReviewCreate(BaseModel):
    author: str = Field(min_length=2, max_length=60)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=3, max_length=800)


class Review(ReviewCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    verified: bool = False
    created_at: datetime = Field(default_factory=now_utc)


# ---------- cart / checkout ----------

class CartLine(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=99)


class QuoteRequest(BaseModel):
    items: list[CartLine]
    coupon: Optional[str] = None
    cep: Optional[str] = None
    shipping_method: Optional[str] = None


class ShippingOption(BaseModel):
    id: str
    name: str
    price: float
    days: str


class Quote(BaseModel):
    subtotal: float
    discount: float
    coupon: Optional[str] = None
    coupon_valid: bool = False
    coupon_message: str = ""
    shipping_options: list[ShippingOption] = []
    shipping: float = 0
    shipping_method: Optional[str] = None
    total: float


class Customer(BaseModel):
    name: str = Field(min_length=3)
    email: EmailStr
    phone: str = Field(min_length=8)
    cpf: str = Field(min_length=11)


class Address(BaseModel):
    cep: str
    street: str = Field(min_length=2)
    number: str = Field(min_length=1)
    complement: str = ""
    district: str = Field(min_length=2)
    city: str = Field(min_length=2)
    state: str = Field(min_length=2, max_length=2)


class OrderLineIn(CartLine):
    options: dict[str, str] = {}
    personalization_name: str = ""
    personalization_message: str = ""
    upload_url: str = ""


class OrderCreate(BaseModel):
    customer: Customer
    address: Address
    items: list[OrderLineIn]
    coupon: Optional[str] = None
    shipping_method: str
    payment_method: Literal["pix", "credit", "debit"]
    installments: int = Field(default=1, ge=1, le=6)


class OrderLine(OrderLineIn):
    name: str
    image: str
    unit_price: float


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: str
    user_id: Optional[str] = None
    customer: Customer
    address: Address
    items: list[OrderLine]
    subtotal: float
    discount: float
    shipping: float
    total: float
    coupon: Optional[str] = None
    shipping_method: str
    payment_method: str
    installments: int
    status: str = "Pagamento aprovado"
    pix_code: Optional[str] = None
    created_at: datetime = Field(default_factory=now_utc)


# ---------- misc ----------

class NewsletterIn(BaseModel):
    email: EmailStr


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    message: str = Field(min_length=5, max_length=2000)


class Message(BaseModel):
    message: str


class UploadIn(BaseModel):
    filename: str
    data_url: str


class UploadOut(BaseModel):
    id: str
    url: str


class User(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None


class GoogleExchange(BaseModel):
    session_id: str = Field(min_length=1, max_length=2048)
