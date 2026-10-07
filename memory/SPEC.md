# Gifts da No — SPEC

Premium personalized-gift e-commerce (pt-BR) selling personalized buttons: ímãs de geladeira, abridores, chaveiros, espelhinhos, mini buttons, brindes — for festas de 15 anos, casamentos, eventos, empresas. DARK navy theme (#233250) with blush pink (#f4cccc) accents (class="dark" on html); logo-pink.png in header/footer; flower corner decorations from user reference (public/flowers-*.png).

## Stack
FastAPI + Mongo (backend/routers: catalog, checkout, auth, misc) · React/Vite/Tailwind v4 (frontend/src).

## Data model
- categories: slug, name, tag, image, order (10 seeded)
- products: id, slug, name, short_description, description, price, promo_price, categories[], images[], stock, sku, badge (Mais vendido|Novo|Oferta), rating, reviews_count, personalization{options[{name,values}], allow_name, allow_message, allow_upload, name_max, message_max}, materials, dimensions, care, production_time, sold (12 seeded via `python seed.py`)
- reviews: product_id, author, rating, comment, verified
- orders: number GNxxxxxx, customer, address, items (with personalization), totals, payment_method pix|credit|debit, status, pix_code (MOCK)
- users / sessions (Google login via Emergent Auth, httpOnly cookie `gn_session`), newsletter, contact_messages

## API (/api)
GET /categories · GET /products?q&categoria&selo&min_price&max_price&ordenar(relevancia|novidades|menor-preco|maior-preco|avaliacao) · GET /products/{slug} · /related · GET/POST /products/{slug}/reviews
POST /cart/quote {items, coupon, cep, shipping_method} → subtotal, discount, shipping_options (PAC/SEDEX by CEP; PAC free ≥ R$299), total
POST /orders (payment SIMULATED; Pix = 5% off) · GET /orders/mine (auth)
POST /newsletter · POST /contact · POST /uploads {filename, data_url} → /api/uploads/{id}
POST /auth/google/exchange · GET /auth/me · POST /auth/logout

Coupons: AFETO10 (10%), BEMVINDA15 (15%, min R$150), FRETEGRATIS (free shipping).

## Frontend
Routes: / , /produtos, /produto/:slug, /checkout (5 steps), /conta (Google login + orders), /favoritos, /sobre, /contato.
Cart, favorites, coupon, CEP persisted in localStorage (lib/store.tsx). Cart drawer, search modal, floating WhatsApp.
