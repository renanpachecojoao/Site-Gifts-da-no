# Gifts da No — guia do projeto

Loja virtual de presentes personalizados (ímãs, chaveiros, espelhinhos, abridores, mini buttons e brindes).

## Estrutura
```
backend/                 API em Python (FastAPI + MongoDB)
  server.py              inicia a API e junta as rotas (/api)
  models/shop.py         modelos de dados (produto, pedido, cupom, usuário...)
  routers/catalog.py     produtos, categorias, avaliações
  routers/checkout.py    carrinho, cupons, frete e pedidos (pagamento SIMULADO)
  routers/auth.py        login com Google
  routers/misc.py        newsletter, contato, upload de artes
  seed.py                cadastra categorias e produtos iniciais
  .env                   configurações (MONGO_URL, DB_NAME, CORS_ORIGINS)
frontend/                Site em React + TypeScript + Tailwind
  index.html             título e descrição para o Google (SEO)
  public/                logos e flores decorativas
  src/index.css          cores e fontes do tema (azul-marinho + rosa)
  src/App.tsx            rotas/páginas
  src/lib/               tipos, formatação, carrinho/favoritos, chamadas à API, imagens
  src/components/layout  Header, Footer, Layout, WhatsApp flutuante
  src/components/shop    ProductCard, CategoryCard, ProductGallery, CartDrawer, SearchModal
  src/components/home    seções da página inicial
  src/pages/             Home, Produtos, Produto, Checkout, Conta, Favoritos, Sobre, Contato
```
Cada arquivo começa com um comentário explicando o que ele faz.

## Como rodar localmente
1. Instale MongoDB, Python 3.11+ e Node 20+ (com yarn).
2. Backend: `cd backend && pip install -r requirements.txt && python seed.py && uvicorn server:app --port 8001 --reload`
3. Frontend: `cd frontend && yarn install && yarn dev` → abra http://localhost:3000

## Personalizações rápidas
- Cores e fontes: `frontend/src/index.css` (variáveis `--color-...`).
- Menu: `NAV` em `Header.tsx`. Contatos/WhatsApp/Instagram: `lib/format.ts` e `Footer.tsx`.
- Produtos: edite `PRODUCTS` em `backend/seed.py` e rode `python seed.py` de novo.
- Cupons: `COUPONS` em `backend/routers/checkout.py`.

## Atenção
- Pagamento (Pix/cartão) e frete são SIMULADOS — integrar gateway real antes de vender.
- Troque telefone, e-mail, CNPJ e redes sociais de exemplo pelos reais.
