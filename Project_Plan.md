# PROJECT_PLAN.md — Bangladesh Ecommerce Store Template

> Read `rules.md` first. Those rules apply to every step below.
> Work on ONE step at a time. After each step, STOP and wait for my approval.

## 1. Goal

A reusable, secure, fast ecommerce **store template** for Bangladeshi clients.
The backend is the same for every client. Only the frontend look (colors, fonts,
logo, product card style) and a few feature flags change, via a per-client config.

**Priorities, in order:** security, speed, simplicity, low hosting cost.

## 2. Stack (do not add other frameworks)

- Backend: **Medusa v2** (use the current official docs, NOT v1 patterns)
- Storefront: **Next.js** (App Router) + **Tailwind CSS** + TypeScript
- Database: PostgreSQL. Cache/queue: Redis
- Local dev: Docker Compose (Postgres + Redis)
- Validation: Zod
- Deployment later: a single VPS with Docker, Cloudflare in front

Ask me before adding ANY new package, and explain why it is needed.

## 3. Deployment model

One deployment and one database **per client**, from the same repo.
Never share secrets or data between clients.

## 4. Target structure

```
store-template/
├── apps/
│   ├── backend/            # Medusa (API + admin)
│   │   └── src/modules/    # custom: payment providers, courier, sms
│   └── storefront/         # Next.js
│       ├── clients/        # one folder per client
│       │   └── demo/config.ts
│       ├── themes/default/ # ProductCard, Header, Footer, layouts
│       ├── lib/            # API client, token loader
│       └── app/            # routes
├── packages/config/        # shared types for client config
├── docker-compose.yml
├── rules.md
├── PROJECT_PLAN.md
└── docs/
    └── log.md              # test results + measurements after every step
```

## 5. Client config (design contract)

Each client has `clients/<name>/config.ts` with: store name, logo, colors
(brand, neutral, accent), font, currency, language(s), enabled payment methods,
courier, product card variant (`A` | `B`). Colors and fonts become CSS variables
(design tokens). Two clients must look different with ZERO component changes.

## 6. Bangladesh requirements

- Cash on delivery (default), bKash/Nagad via a gateway aggregator
- Couriers: Steadfast / Pathao
- Bangla + English UI
- BD phone validation (+880 / 01XXXXXXXXX), division → district → upazila address
- SMS order confirmation via a local gateway

## 7. UI principles

Simple, clean, mobile-first. One typeface (self-hosted), two weights. Generous
whitespace. Product card = image, name, price, one button. No sliders, popups,
or chat widgets. Large tap targets (44px+). Sticky "Add to cart" on mobile
product pages. Single-page checkout with minimal fields.

**Performance targets:** Lighthouse mobile 95+, LCP < 2.5s on throttled 4G,
JS < 100 KB per page, server components by default, optimized images (AVIF/WebP)
with explicit width/height.

## 8. Security requirements (always on)

- Prices, totals, stock, discounts, payment status: computed/verified on the SERVER only
- Payment webhooks: verify signature AND be idempotent (replay must not duplicate orders)
- Never handle card data; use hosted gateway pages
- No secrets in code or git; `.env` ignored, `.env.example` provided
- Validate all input with Zod; parameterized queries only
- Strict CSP (no `unsafe-inline` / `*`), HSTS, and other security headers
- httpOnly + Secure + SameSite cookies; Argon2id/bcrypt for passwords
- Rate limiting + Cloudflare Turnstile on login, checkout, OTP
- Admin on a separate subdomain, strong auth, 2FA if possible
- Least-privilege DB user; encrypted daily backups; `npm audit` clean
- Never disable a check "for development" without telling me

## 9. Working loop (every step)

1. Read the step. Reply with a **plan in ≤5 bullets**. Wait for approval.
2. Build only that step. No extra features, no unrelated refactors.
3. Report: files changed, new dependencies (with reason), how to run it, how to test it, what could break.
4. I run the **test gate** myself and record results in `docs/log.md`.
5. We optimize (measure before and after).
6. I commit and tag (`step-X.Y-done`). Then, and only then, the next step.

---

## 10. Steps

### Phase 0 — Foundation

**Step 0.1 — Repo and local environment**
- Monorepo layout above, git, `.gitignore` (excludes `.env`), `docker-compose.yml` for Postgres + Redis.
- Do NOT install Medusa or Next.js yet.
- *Test gate:* `docker compose up` works from a clean clone; services healthy.

**Step 0.2 — Medusa backend alone**
- Create Medusa v2 in `apps/backend`, connect to Postgres/Redis, create admin user, `.env` + `.env.example`.
- *Test gate:* admin opens; I add a product and a region; `curl` to the store API returns the product.
- *Optimize:* record API response time and memory use as baseline.

### Phase 1 — Storefront basics

**Step 1.1 — Next.js storefront connected to Medusa**
- Product list + product detail pages, minimal styling.
- *Test gate:* my product appears; unknown product returns a proper 404.
- *Optimize:* record Lighthouse score.

**Step 1.2 — Design tokens and client config**
- `clients/demo/config.ts` → CSS variables → Tailwind. Select client via env var.
- *Test gate:* changing one color changes the whole site; a second client config looks different with no component changes.

**Step 1.3 — Clean, fast UI**
- Header, footer, product card, product page; mobile-first; self-hosted font; framework image component.
- *Test gate:* correct at 360px on a real phone; Lighthouse mobile run.
- *Optimize:* hit the targets in section 7.

**Step 1.4 — Swappable product card**
- `ProductCardA` / `ProductCardB` chosen by config.
- *Test gate:* both handle long names, missing images, out-of-stock.

### Phase 2 — Cart and checkout (COD first)

**Step 2.1 — Cart**
- Server-side cart; only the cart ID in a cookie. Add/remove/update quantity.
- *Test gate:* tampering with price/quantity (negative, huge, non-numeric) is rejected or corrected server-side.

**Step 2.2 — Bangladesh checkout with COD**
- Single-page form with BD phone validation and division/district/upazila picker.
- *Test gate:* invalid input, empty fields, double-click submit (no duplicate order), full order appears in admin.

**Step 2.3 — Order confirmation + SMS**
- Confirmation page; SMS via Medusa subscriber.
- *Test gate:* SMS arrives; gateway failure does NOT break the order and is logged.

### Phase 3 — Security baseline

**Step 3.1 — Headers and CSP** — *Gate:* securityheaders.com / Mozilla Observatory scan; UI still works.
**Step 3.2 — Rate limiting and bot protection** — *Gate:* 50 rapid requests get throttled/blocked.
**Step 3.3 — Input validation and secrets** — *Gate:* malformed JSON, oversized bodies, SQL-like strings handled; `npm audit` clean; no secrets in git history.
**Step 3.4 — Admin hardening** — *Gate:* admin not reachable from the public store domain.

### Phase 4 — Online payments

**Step 4.1 — One gateway (SSLCommerz or AamarPay) as a Medusa payment provider** (sandbox first)
- *Gate:* success, failure, cancel, abandoned; **replayed webhook** does not duplicate the order; **forged webhook** is rejected.

**Step 4.2 — bKash/Nagad** (direct or via the same aggregator), same gate.

### Phase 5 — Fulfillment

**Step 5.1 — Courier module (Steadfast or Pathao)**
- Book a parcel from admin, store tracking code, show tracking link.
- *Gate:* sandbox booking works; courier API downtime is handled gracefully.

### Phase 6 — Production readiness

**Step 6.1 — Deployment** (VPS, Docker, reverse proxy, HTTPS) — *Gate:* deploy the demo client from scratch using only written notes.
**Step 6.2 — Backups and monitoring** — *Gate:* restore a backup into a clean database.
**Step 6.3 — Clone for a real client** — *Done when:* a second client goes live in 1–2 days.

---

## 11. Start now

Begin with **Step 0.1 only**. Reply with your plan in ≤5 bullets and wait for my approval.