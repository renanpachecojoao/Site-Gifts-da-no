import re
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from lib.db import db
from models.shop import Category, Product, Review, ReviewCreate

router = APIRouter()

SORTS = {
    "relevancia": [("sold", -1)],
    "menor-preco": [("effective_price", 1)],
    "maior-preco": [("effective_price", -1)],
    "avaliacao": [("rating", -1), ("reviews_count", -1)],
    "novidades": [("created_at", -1)],
}


@router.get("/categories", response_model=list[Category])
async def list_categories():
    docs = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return [Category(**d) for d in docs]


@router.get("/products", response_model=list[Product])
async def list_products(
    q: Optional[str] = None,
    categoria: Optional[str] = None,
    selo: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    ordenar: str = "relevancia",
    limit: int = Query(default=60, le=200),
):
    match: dict = {}
    if q:
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        match["$or"] = [{"name": rx}, {"short_description": rx}, {"categories": rx}]
    if categoria:
        match["categories"] = {"$in": categoria.split(",")}
    if selo:
        match["badge"] = {"$regex": f"^{re.escape(selo.replace('-', ' '))}$", "$options": "i"}
    price_filter: dict = {}
    if min_price is not None:
        price_filter["$gte"] = min_price
    if max_price is not None:
        price_filter["$lte"] = max_price
    pipeline: list[dict] = [
        {"$match": match},
        {"$addFields": {"effective_price": {"$ifNull": ["$promo_price", "$price"]}}},
    ]
    if price_filter:
        pipeline.append({"$match": {"effective_price": price_filter}})
    pipeline += [{"$sort": dict(SORTS.get(ordenar, SORTS["relevancia"]))}, {"$limit": limit}, {"$project": {"_id": 0}}]
    docs = await db.products.aggregate(pipeline).to_list(limit)
    return [Product(**d) for d in docs]


async def _get(slug: str) -> dict:
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return doc


@router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    return Product(**await _get(slug))


@router.get("/products/{slug}/related", response_model=list[Product])
async def related_products(slug: str):
    doc = await _get(slug)
    docs = (
        await db.products.find(
            {"slug": {"$ne": slug}, "categories": {"$in": doc["categories"]}}, {"_id": 0}
        )
        .sort("sold", -1)
        .to_list(4)
    )
    return [Product(**d) for d in docs]


@router.get("/products/{slug}/reviews", response_model=list[Review])
async def list_reviews(slug: str):
    doc = await _get(slug)
    docs = await db.reviews.find({"product_id": doc["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Review(**d) for d in docs]


@router.post("/products/{slug}/reviews", response_model=Review, status_code=201)
async def create_review(slug: str, body: ReviewCreate):
    doc = await _get(slug)
    review = Review(**body.model_dump(), product_id=doc["id"])
    await db.reviews.insert_one(review.model_dump())
    count = doc.get("reviews_count", 0)
    new_rating = round((doc.get("rating", 0) * count + body.rating) / (count + 1), 1)
    await db.products.update_one({"id": doc["id"]}, {"$set": {"rating": new_rating, "reviews_count": count + 1}})
    return review
