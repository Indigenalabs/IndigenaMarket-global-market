# Indigena Global Market

Indigena Global Market is a standalone Next.js marketplace and cultural platform built around ten pillar ecosystems, creator storefronts, nation/community storefronts, Seva giving, and Launchpad fundraising.

This repository contains the product app, internal API layer, audit tooling, Playwright coverage, and Supabase migration history for the current platform build.

## What the app includes

- 10 pillar marketplace surfaces:
  - Digital Arts
  - Physical Items
  - Courses
  - Freelancing
  - Seva
  - Cultural Tourism
  - Language & Heritage
  - Land & Food
  - Advocacy & Legal
  - Materials & Tools
- Creator Hub with solo and nation/community storefront context
- Nations & Communities storefront layer
- Launchpad crowdfunding flows
- Shared wallet session auth
- Admin and operations surfaces
- Release-gate audit suite for route, CTA, and modal regression coverage

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Stripe
- Playwright

## Repo structure

- `src/app`
  - app routes, layouts, UI, API routes, and product logic
- `public`
  - static assets for storefronts, Launchpad, and shared UI
- `scripts`
  - audit runners and release-gate automation
- `supabase/migrations`
  - platform and pillar migration history
- `tests/e2e`
  - Playwright end-to-end coverage
- `docs`
  - deployment and operational notes

## Local development

Install dependencies:

```bash
npm ci
```

Start the app in dev mode:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Start the production preview locally:

```bash
npm run build
npm run start
```

## Environment setup

Copy the example file first:

```bash
cp .env.local.example .env.local
```

Core runtime values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INDIGENA_WALLET_SESSION_SECRET`

Key operational values used by the current app:

- `ADVOCACY_PAYMENT_WEBHOOK_SECRET`
- `SUPABASE_ADVOCACY_EVIDENCE_BUCKET`
- `ADVOCACY_ADMIN_WALLETS`
- `ADVOCACY_LEGAL_OPS_WALLETS`
- `MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET`
- `SUPABASE_MATERIALS_TOOLS_PROOF_BUCKET`
- `SUPABASE_CREATOR_PROFILE_MEDIA_BUCKET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `MARKETING_PAYMENT_WEBHOOK_SECRET`

Recommended local defaults:

- `NEXT_PUBLIC_USE_APP_API=true`
- `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=false`
- `NEXT_PUBLIC_ALLOW_TOURISM_MOCKS=false`
- `ALLOW_RUNTIME_PERSISTENCE_IN_PRODUCTION=false`

## Database setup

Apply Supabase migrations from:

- `supabase/migrations`

The migrations are already organized by app foundation, shared ops, pillar systems, monetization phases, and governance/trust layers.

Recommended rollout order:

1. core platform
2. shared marketplace ops
3. active pillar schemas
4. revenue and operations phases

## Quality gates

Run the full audit suite:

```bash
npm run test:audit
```

Run the enforced release gate:

```bash
npm run test:release-gate
```

Generate the latest launch readiness report from a running app:

```bash
npm run test:launch-readiness -- http://127.0.0.1:3000
```

The release gate does all of the following:

1. builds the app
2. starts a production preview
3. runs:
   - full route audit
   - commerce CTA audit
   - modal flow audit
   - smoke tests for pillar routes and launch-readiness admin access
4. writes `.runtime/launch-readiness.json`
5. fails if any route coverage gaps or interaction regressions are found

The admin launch-hardening surface is available at:

- `/admin/launch-readiness`

It reads:

- environment and integration posture
- audit coverage from `.runtime/audit-summary.json`
- the latest generated launch report from `.runtime/launch-readiness.json`

## Playwright checks

Run focused smoke coverage:

```bash
npm run test:smoke
```

Run the full e2e suite:

```bash
npm run test:e2e
```

## Operational notes

- Do not commit `.env.local`
- Do not rely on `.runtime` JSON persistence in production
- Use verified wallet or Supabase-backed sessions for sensitive flows
- Keep `Release Gate` required on `main`

## GitHub branch protection

For the public repo, protect `main` and require the `Release Gate` status check before merge.

## Repository description

Suggested GitHub repo description:

`Indigena Global Market: a Next.js cultural marketplace platform with 10 pillar ecosystems, creator and nation storefronts, Seva giving, and Launchpad crowdfunding.`
