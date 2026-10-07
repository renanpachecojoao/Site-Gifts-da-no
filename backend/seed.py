# Script que popula o banco com as categorias, os 12 produtos e avaliações iniciais.
# Como rodar:  cd backend && python seed.py
# - IMG: endereços das fotos dos produtos.
# - CATEGORIES: (slug, nome, frase, imagem).
# - PRODUCTS: produtos com preço, preço promocional, categorias, opções e prazos.
#   Para cadastrar um produto novo, copie um bloco dict(...) e altere os campos.
# - main(): apaga produtos/avaliações antigos e grava tudo de novo.
"""Idempotent catalog seed: `cd /app/backend && python seed.py`."""

import asyncio
from datetime import timedelta

from lib.db import db, ensure_indexes
from models.shop import Category, OptionGroup, Personalization, Product, Review, now_utc


G = "https://static.prod-images.emergentagent.com/jobs/4549265b-f990-4a2f-a690-f52f74538705/images/"
IMG = {
    "ima": G + "fda99801ed59b8595961703c7bfca0c3e9460fbec0734dd92c1e778cc367fde2.jpeg",
    "ima_kit": G + "183e4ad04164526af4659b70a314ca2a9a3215613fa154629834840a1501f49e.jpeg",
    "abridor": G + "2bd011b92b1a8c257fc76b1df76d33c773fab8e7b3e07f532400b91f62d6ba70.jpeg",
    "chaveiro": G + "3e1e3b9675987d8db4972fe813ec4039e3ca0a2b9e95b6c0cdf7e5c43d41efd5.jpeg",
    "espelho": G + "0abc45b906c903e19543a73914afb65a71f574b29708e15d40a2f1e38f88b016.jpeg",
    "mini": G + "edd17d96239163ef449cbf842f9d45544716b452f04ecb418a97950a7f3ff939.jpeg",
    "brinde": G + "4095c39c4a684d9739560bab5365808ea7d41e5c34355a5102ad0175a934e85b.jpeg",
    "quinze": G + "c45f4c52ba991cf8d4a0ae852a0966a7ff6ed75d08a103d1663d2f7aaf403411.jpeg",
    "casamento": G + "eb437cbb2fbf61e1bc8921b2dcec583642320434d24033461857a0ee0e76bc44.jpeg",
    "empresa": G + "5c0fd0693eff93688a9195577a9b556cbb5a15ad4365b57ca19467a95aea544f.jpeg",
    "colecao": G + "1828503381f0c4368d0deb645941ea409a1aa039faf4a15a7c5550e4e7f19c21.jpeg",
    "atelie": G + "6cfb6b58e99972719acd36f0379fc4e4a004aeede76e53f751815acb90b1314b.jpeg",
}

CATEGORIES = [
    ("imas", "Ímãs de geladeira", "Decore o dia a dia", "ima"),
    ("abridores", "Abridores de garrafa", "Praticidade com estilo", "abridor"),
    ("chaveiros", "Chaveiros", "Sua paixão sempre junto", "chaveiro"),
    ("espelhinhos", "Espelhinhos", "Beleza em cada detalhe", "espelho"),
    ("mini-buttons", "Mini buttons para cadernos", "Estilo para o caderno", "mini"),
    ("brindes", "Brindes personalizados", "Produtos que encantam", "brinde"),
    ("festas-15-anos", "Festas de 15 anos", "Lembrancinhas inesquecíveis", "quinze"),
    ("casamentos", "Casamentos", "Noivos & padrinhos", "casamento"),
    ("eventos", "Eventos", "Batizados, chás e festas", "ima_kit"),
    ("empresas", "Empresas", "Sua marca em destaque", "empresa"),
]

COMMON_CARE = "Limpe apenas com pano macio e seco. Evite água, produtos abrasivos e exposição prolongada ao sol para preservar as cores."
TAM = OptionGroup(name="Tamanho", values=["3,8 cm", "4,5 cm", "5,5 cm"])
ACAB = OptionGroup(name="Acabamento", values=["Brilho", "Fosco"])
EMB = OptionGroup(name="Embalagem", values=["Saquinho com laço", "Caixinha individual", "Sem embalagem"])
FULL = dict(allow_name=True, allow_message=True, allow_upload=True, name_max=30, message_max=200)
BASE_MAT = "Base metálica estampada, papel fotográfico de alta resolução e película protetora cristal"

PRODUCTS = [
    dict(slug="ima-geladeira-personalizado", name="Ímã de Geladeira Personalizado · 10 un", badge="Mais vendido",
         short_description="Ímãs redondos com a sua arte, foto ou nome. Acabamento brilhante e ímã forte.",
         price=49.90, promo_price=39.90, categories=["imas", "eventos", "festas-15-anos", "casamentos"],
         images=["ima", "ima_kit"], stock=500, sold=980, rating=5.0, reviews_count=126,
         personalization=Personalization(options=[TAM, ACAB], **FULL),
         materials=BASE_MAT + ", manta magnética flexível.", dimensions="Ø 5,5 cm (ou 3,8 / 4,5 cm) · kit com 10 unidades",
         production_time="3 a 5 dias úteis"),
    dict(slug="kit-imas-lembrancinha", name="Kit Ímãs Lembrancinha · 30 un", badge="Oferta",
         short_description="O queridinho das festas: 30 ímãs iguais ou com nomes diferentes para cada convidado.",
         price=119.90, promo_price=99.90, categories=["imas", "festas-15-anos", "eventos"],
         images=["ima_kit", "quinze"], stock=200, sold=640, rating=4.9, reviews_count=88,
         personalization=Personalization(options=[TAM, EMB], **FULL),
         materials=BASE_MAT + ", manta magnética flexível.", dimensions="Ø 4,5 cm · 30 unidades",
         production_time="4 a 6 dias úteis"),
    dict(slug="abridor-garrafa-ima", name="Abridor de Garrafa com Ímã · 5 un", badge="Novo",
         short_description="Abridor e ímã em um só produto, com a sua arte em destaque.",
         price=79.90, promo_price=69.90, categories=["abridores", "casamentos", "empresas", "eventos"],
         images=["abridor", "casamento"], stock=300, sold=310, rating=4.9, reviews_count=41,
         personalization=Personalization(options=[ACAB, EMB], **FULL),
         materials=BASE_MAT + ", abridor em aço e ímã no verso.", dimensions="Ø 5,8 cm · kit com 5 unidades",
         production_time="3 a 5 dias úteis"),
    dict(slug="kit-abridores-casamento", name="Kit Abridores Casamento · 20 un", badge=None,
         short_description="Lembrança útil para padrinhos e convidados, com monograma e data dos noivos.",
         price=239.90, promo_price=209.90, categories=["abridores", "casamentos"],
         images=["casamento", "abridor"], stock=150, sold=190, rating=5.0, reviews_count=27,
         personalization=Personalization(options=[ACAB, EMB], **FULL),
         materials=BASE_MAT + ", abridor em aço e ímã no verso.", dimensions="Ø 5,8 cm · 20 unidades",
         production_time="5 a 7 dias úteis"),
    dict(slug="chaveiro-button-coracao", name="Chaveiro Button com Pingente Coração · 5 un", badge="Mais vendido",
         short_description="Chaveiro com argola reforçada e pingente de coração. Leve sua arte sempre com você.",
         price=74.90, promo_price=64.90, categories=["chaveiros", "festas-15-anos", "brindes"],
         images=["chaveiro", "colecao"], stock=400, sold=720, rating=5.0, reviews_count=97,
         personalization=Personalization(options=[OptionGroup(name="Pingente", values=["Coração prata", "Coração rosé", "Sem pingente"]), ACAB], **FULL),
         materials=BASE_MAT + ", argola e pingente em metal niquelado.", dimensions="Ø 4,5 cm · kit com 5 unidades",
         production_time="3 a 5 dias úteis"),
    dict(slug="chaveiro-marca-empresa", name="Chaveiro com a sua Marca · 50 un", badge=None,
         short_description="Brinde corporativo durável para clientes, feiras e equipes.",
         price=289.00, promo_price=None, categories=["chaveiros", "empresas", "eventos"],
         images=["empresa", "chaveiro"], stock=100, sold=150, rating=4.8, reviews_count=19,
         personalization=Personalization(options=[ACAB, EMB], **FULL),
         materials=BASE_MAT + ", argola em metal niquelado.", dimensions="Ø 4,5 cm · 50 unidades",
         production_time="5 a 8 dias úteis"),
    dict(slug="espelhinho-bolso-personalizado", name="Espelhinho de Bolso Personalizado · 5 un", badge="Novo",
         short_description="Espelho de um lado, sua arte do outro. Delicado e perfeito para a bolsa.",
         price=69.90, promo_price=None, categories=["espelhinhos", "festas-15-anos", "casamentos", "brindes"],
         images=["espelho", "colecao"], stock=250, sold=280, rating=4.9, reviews_count=44,
         personalization=Personalization(options=[ACAB, EMB], **FULL),
         materials=BASE_MAT + ", espelho em acrílico espelhado.", dimensions="Ø 5,8 cm · kit com 5 unidades",
         production_time="3 a 5 dias úteis"),
    dict(slug="kit-espelhinhos-madrinhas", name="Kit Espelhinhos Madrinhas · 10 un", badge=None,
         short_description="Lembrança encantadora para madrinhas e daminhas, com nome de cada uma.",
         price=139.90, promo_price=119.90, categories=["espelhinhos", "casamentos"],
         images=["espelho", "casamento"], stock=120, sold=160, rating=5.0, reviews_count=23,
         personalization=Personalization(options=[EMB], **FULL),
         materials=BASE_MAT + ", espelho em acrílico espelhado.", dimensions="Ø 5,8 cm · 10 unidades",
         production_time="4 a 6 dias úteis"),
    dict(slug="mini-buttons-cadernos", name="Mini Buttons para Cadernos · 12 un", badge="Mais vendido",
         short_description="Bottons pequenos com alfinete para cadernos, mochilas, estojos e planners.",
         price=44.90, promo_price=None, categories=["mini-buttons", "brindes"],
         images=["mini", "colecao"], stock=600, sold=830, rating=4.9, reviews_count=112,
         personalization=Personalization(options=[OptionGroup(name="Tamanho", values=["2,5 cm", "3,8 cm"]), ACAB], **FULL),
         materials=BASE_MAT + ", alfinete de segurança no verso.", dimensions="Ø 2,5 cm ou 3,8 cm · 12 unidades",
         production_time="2 a 4 dias úteis"),
    dict(slug="botton-alfinete-eventos", name="Botton com Alfinete para Eventos · 50 un", badge=None,
         short_description="Identifique equipes, convidados e campanhas com bottons de alta qualidade.",
         price=199.90, promo_price=179.90, categories=["eventos", "empresas", "mini-buttons"],
         images=["empresa", "ima_kit"], stock=300, sold=210, rating=4.8, reviews_count=31,
         personalization=Personalization(options=[TAM, ACAB], **FULL),
         materials=BASE_MAT + ", alfinete de segurança no verso.", dimensions="Ø 3,8 a 5,5 cm · 50 unidades",
         production_time="4 a 7 dias úteis"),
    dict(slug="brinde-personalizado-laco", name="Brinde Personalizado com Laço · 10 un", badge="Oferta",
         short_description="Button com a sua arte em cartão e saquinho com laço de cetim. Pronto para entregar.",
         price=89.90, promo_price=79.90, categories=["brindes", "festas-15-anos", "casamentos", "eventos"],
         images=["brinde", "colecao"], stock=300, sold=450, rating=5.0, reviews_count=64,
         personalization=Personalization(options=[OptionGroup(name="Cor do laço", values=["Rosa", "Azul-marinho", "Branco"]), TAM], **FULL),
         materials=BASE_MAT + ", cartão couché, saquinho transparente e fita de cetim.", dimensions="Cartão 8 × 10 cm · 10 unidades",
         production_time="4 a 6 dias úteis"),
    dict(slug="kit-debutante-15-anos", name="Kit Debutante 15 Anos · 50 peças", badge="Novo",
         short_description="Mix de ímãs, chaveiros e espelhinhos com o nome da debutante para toda a festa.",
         price=349.00, promo_price=299.00, categories=["festas-15-anos", "brindes"],
         images=["quinze", "brinde"], stock=60, sold=120, rating=5.0, reviews_count=18,
         personalization=Personalization(options=[EMB], **FULL),
         materials=BASE_MAT + ", ímãs, argolas e espelhos conforme o mix.", dimensions="50 peças sortidas (Ø 4,5 a 5,8 cm)",
         production_time="6 a 8 dias úteis"),
]

REVIEWS = [
    ("Mariana C.", 5, "Ficaram lindos! Cores fiéis à arte e acabamento impecável. Os convidados amaram."),
    ("Rafael A.", 5, "Chegou bem embalado e antes do prazo. A Noemi ajudou a ajustar a arte pelo WhatsApp."),
    ("Beatriz V.", 4, "Qualidade excelente, já estou fazendo o segundo pedido para a empresa."),
]


async def main() -> None:
    await db.categories.delete_many({})
    await db.categories.insert_many(
        [Category(slug=s, name=n, tag=t, image=IMG[i], order=k).model_dump() for k, (s, n, t, i) in enumerate(CATEGORIES)]
    )
    await db.products.delete_many({})
    await db.reviews.delete_many({})
    base = now_utc()
    for k, p in enumerate(PRODUCTS):
        data = {**p, "images": [IMG[i] for i in p["images"]], "sku": f"GN-{1000 + k}", "care": COMMON_CARE,
                "description": f"{p['short_description']} Envie sua arte pronta ou conte a sua ideia: nossa equipe cria ou ajusta o layout e envia uma prévia pelo WhatsApp para aprovação antes da produção. Cada peça é prensada e conferida à mão no nosso ateliê."}
        existing = await db.products.find_one({"slug": p["slug"]}, {"_id": 0, "id": 1})
        prod = Product(**data, created_at=base - timedelta(days=k * 3))
        if existing:
            prod.id = existing["id"]
        await db.products.replace_one({"slug": p["slug"]}, prod.model_dump(), upsert=True)
        if await db.reviews.count_documents({"product_id": prod.id}) == 0:
            await db.reviews.insert_many(
                [Review(author=a, rating=r, comment=c, product_id=prod.id, verified=True,
                        created_at=base - timedelta(days=j * 5 + k)).model_dump() for j, (a, r, c) in enumerate(REVIEWS)]
            )
    await ensure_indexes()
    print("seeded", len(PRODUCTS), "products,", len(CATEGORIES), "categories")


if __name__ == "__main__":
    asyncio.run(main())
