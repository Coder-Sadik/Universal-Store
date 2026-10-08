# Verification & Performance Log

This document records the test results, gate verifications, and performance measurements for each step of the Universal Store template.

---

## Step 0.1 — Repo and Local Environment

- **Date:** 2026-10-08
- **Objective:** Verify monorepo layout, git tracking, .gitignore rules, and Docker Compose configuration for PostgreSQL and Redis.
- **Images Used:**
  - `postgres:16.8-alpine`
  - `redis:7.4.2-alpine`
- **Security & Port Binding:**
  - PostgreSQL: `127.0.0.1:5432:5432`
  - Redis: `127.0.0.1:6379:6379`
  - Password required for Redis connection and healthcheck.
  - Required environment variables strictly enforced via `${VAR:?error}` syntax.
- **Test Gate Status:**
  - Verified: `docker compose ps` shows both services `healthy`.

---

## Step 0.2 — Medusa Backend Alone

- **Date:** 2026-10-08
- **Objective:** Create Medusa v2 backend in `apps/backend`, connect to PostgreSQL and Redis from Docker Compose, enforce strict secret validation without defaults, apply migrations, and verify Store API.
- **Key Configurations:**
  - Medusa Version: `2.21.2`
  - Node.js Version: `v25.3.0` (npm `11.6.2`)
  - CORS: Explicit localhost origins only (`http://localhost:8000`, `http://localhost:5173`, `http://localhost:9000`).
  - Secrets: Strict fail-at-startup validation for `JWT_SECRET` and `COOKIE_SECRET` with zero fallbacks.
  - Zero third-party dependencies added beyond official Medusa core packages.
- **Test Gate Status:**
  - Migrations: `npx medusa db:migrate` completed cleanly (exit code 0).
  - Admin Dashboard: Accessible on `http://localhost:9000/app`.
  - Store API: `curl http://localhost:9000/store/products` with `x-publishable-api-key` header returns HTTP 200 with product catalogue.
- **Baseline Measurements:**
  - Store API Response Time: ~75 ms
  - Medusa Backend Process Memory: ~488 MB (Working Set)

