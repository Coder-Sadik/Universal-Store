# Project rules
- Stack: Medusa (backend), Next.js + Tailwind (storefront), Postgres, Redis. Do not add other frameworks.
- Work on ONE step at a time. Do not build ahead or refactor unrelated files.
- Before coding, state the plan in 5 bullets and wait for my approval.
- Never trust the client: prices, totals, stock and payment status are computed/verified on the server only.
- Never hardcode secrets. Use env vars and keep .env out of git. Provide .env.example only.
- Validate all input with Zod. Use parameterized queries only.
- Prefer fewer dependencies. Ask before adding any package, and say why.
- After each change: list files changed, how to test it, and what could break.
- Keep JS bundle small: server components by default, client components only when needed.
