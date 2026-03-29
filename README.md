This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

1. Copy `.env.local.example` to `.env.local` and fill in:
   - Production-required core:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `INDIGENA_WALLET_SESSION_SECRET` for shared wallet-backed session signing and refresh rotation
   - Production-required Pillar 9:
     - `ADVOCACY_PAYMENT_WEBHOOK_SECRET` for signed payment reconciliation webhooks into Pillar 9
     - `SUPABASE_ADVOCACY_EVIDENCE_BUCKET` for Pillar 9 private ICIP evidence uploads
     - `ADVOCACY_ADMIN_WALLETS` for comma-separated admin wallets allowed to run Pillar 9 ops writes
     - `ADVOCACY_LEGAL_OPS_WALLETS` for comma-separated legal-ops wallets allowed to run Pillar 9 workflow writes
   - Production-required Pillar 10:
     - `MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET` for signed materials order reconciliation webhooks
     - `SUPABASE_MATERIALS_TOOLS_PROOF_BUCKET` for supplier proof documents and traceability files
     - `SUPABASE_CREATOR_PROFILE_MEDIA_BUCKET` for creator avatar and cover image uploads
     - `MARKETING_PAYMENT_WEBHOOK_SECRET` for signed creator ad payment reconciliation webhooks
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_MARKETING_WEBHOOK_SECRET` for Stripe-hosted creator ad checkout
   - Normal app runtime:
     - `NEXT_PUBLIC_USE_APP_API=true` to keep the frontend on the internal Next/Supabase `/api` path
   - Optional integrations / alternate routing:
     - `NEXT_PUBLIC_API_BASE_URL` only when you intentionally want the frontend to target an external API host instead of the in-app `/api` routes
   - Local dev / demo-only:
     - `ADVOCACY_ALLOW_DEV_HEADER_AUTH=true` only for local build-mode/dev fallback when you do not yet have real Supabase sessions wired
     - `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=false` to keep app-wide demo/mock fallback disabled unless you explicitly want preview mode
     - `NEXT_PUBLIC_ALLOW_TOURISM_MOCKS=false` to keep Pillar 6 tourism-specific mock responses disabled unless you explicitly want them
     - `ALLOW_RUNTIME_PERSISTENCE_IN_PRODUCTION=false` to block `.runtime` JSON persistence in production-like environments
2. Apply SQL migrations in `supabase/migrations` in this order:
   - Core platform:
     - `20260312_app_core_foundation.sql` (app-wide pillars baseline)
     - `20260312_app_core_rls.sql` (app-wide RLS baseline)
     - `20260313_app_wallet_auth.sql` (shared wallet challenges and refresh sessions)
   - Shared marketplace ops:
     - `20260312_marketplace_ops_core.sql` (moderation/community/finance/seva ops tables)
   - Pillar-specific data models:
     - `20260312_courses_core.sql` (Pillar 3 enrollments/receipts/progress/events)
     - `20260312_cultural_tourism_core.sql` (Pillar 6 experiences/bookings/reviews/operators)
     - `20260312_language_heritage_core.sql` (Pillar 7 access/receipts/events/sacred requests)
      - `20260313_materials_tools_core.sql` (Pillar 10 suppliers/listings/rentals/services/co-op actions)
      - `20260313_materials_tools_ops.sql` (Pillar 10 orders, rental bookings, co-op commitments, origin stories)
      - `20260313_materials_tools_seed.sql` (Pillar 10 starter suppliers, products, rentals, services, and co-op orders)
   - Pillar 9 advocacy/legal:
     - `20260312_pillar9_advocacy_actions.sql` (action flows)
     - `20260312_pillar9_advocacy_catalog.sql` (public attorneys/campaigns/resources/victories)
     - `20260312_pillar9_advocacy_ops.sql` (case workflow, campaign review, clinic slots)
     - `20260313_pillar9_advocacy_launch_ops.sql` (shared rate limits, operational events, payment webhook receipts)
   - Revenue Phase 1:
     - `20260320_phase1_transaction_fee_breakdowns.sql`
     - `20260320_phase1_subscription_state.sql`
     - `20260320_phase1_subscription_billing_fields.sql`
     - `20260320_phase1_physical_and_freelance_orders.sql`
     - `20260320_phase1_remaining_pillar_transactions.sql`
     - `20260321_phase1_finance_case_management.sql`
     - `20260321_phase1_materials_supplier_actor.sql`
   - Revenue Phase 2:
     - `20260320_phase2_verification_purchases.sql`
     - `20260321_phase2_archive_access_logs.sql`
     - `20260321_phase2_course_certificates.sql`
     - `20260321_phase2_institutional_archive_seats.sql`
     - `20260321_phase2_verification_review_ops.sql`
     - `20260321_phase2_verification_review_events.sql`
   - Revenue Phase 3:
     - `20260321_phase3_enterprise_inquiries.sql`
     - `20260321_phase3_custom_work_and_events.sql`
   - Revenue Phase 4:
     - `20260321_phase4_ops_financial_seva.sql`
   - Revenue Phase 5:
     - `20260321_phase5_data_ads_physical.sql`
   - Revenue Phase 7:
     - `20260321_phase7_governance_controls.sql`
3. Practical rollout order:
   - Run `Core platform` first
   - Then `Shared marketplace ops`
   - Then the pillar schemas you actively need
    - Run `20260313_materials_tools_ops.sql` right after `20260313_materials_tools_core.sql` so Pillar 10 order, booking, commitment, and origin flows have their backing tables
    - Run `20260313_materials_tools_seed.sql` immediately after the Pillar 10 core + ops migrations if you want Pillar 10 to render seeded supplier and inventory data on first boot
   - Finish with `Pillar 9 advocacy/legal` before enabling real Pillar 9 payments, uploads, or legal ops
   - Then apply `Revenue Phase 1` through `Revenue Phase 5` in order without skipping later migration groups

4. Production hardening requirements:
   - Do not rely on `.runtime` JSON persistence in production. Configure Supabase before enabling revenue systems.
   - Enterprise contract uploads require private Supabase storage via `SUPABASE_ENTERPRISE_CONTRACT_BUCKET`.
   - Wallet-authenticated actions now gate financial services, event creation, and commission submissions.
   - Use `npm run test:smoke` after `npm run build` to verify the app against `next start` on a dedicated smoke-test port.
   - Financial services now require governance-approved KYC/AML profiles before payout, BNPL, or tax-report actions succeed.
   - Monetized data insight products now create governance data-use consent records that should be reviewed from `/admin/governance`.

For Pillar 9, production should use verified sessions for supporter writes. That can now be either:
- a real Supabase user session, or
- a verified shared wallet session from `/api/auth/wallet/*`

Header-only wallet identity is now a dev-only fallback controlled by `ADVOCACY_ALLOW_DEV_HEADER_AUTH`.

### App-wide wallet auth

- Shared endpoints:
  - `POST /api/auth/wallet/challenge`
  - `POST /api/auth/wallet/verify`
  - `POST /api/auth/wallet/refresh`
  - `POST /api/auth/wallet/logout`
  - `GET /api/auth/wallet/me`
- Signing model:
  - client signs a challenge message with `personal_sign`
  - server verifies the signature with `ethers.verifyMessage`
  - server issues a short-lived signed access token plus a rotated refresh token backed by Supabase
- Cultural Tourism now uses this shared wallet session layer instead of its earlier fake JWT flow.

### Pillar 9 payment webhook

- Endpoint: `/api/advocacy-legal/webhooks/payment`
- Required headers:
  - `x-indigena-webhook-timestamp`
  - `x-indigena-webhook-signature`
- Signature format:
  - HMAC-SHA256 hex digest of `${timestamp}.${rawBody}`
  - keyed with `ADVOCACY_PAYMENT_WEBHOOK_SECRET`
- Supported `paymentState` values:
  - `processing`
  - `succeeded`
  - `failed`
  - `refunded`
  - `cancelled`

### Pillar 9 launch observability

- Internal audit surface: `/advocacy-legal/dashboard/audit-center`
- Legal ops surface: `/advocacy-legal/dashboard/legal-professional`
- New telemetry sources:
  - shared write/upload rate-limit events

### Pillar 10 payment webhook

- Endpoint: `/api/materials-tools/webhooks/payment`
- Required headers:
  - `x-indigena-webhook-timestamp`
  - `x-indigena-webhook-signature`
- Signature format:
  - HMAC-SHA256 hex digest of `${timestamp}.${rawBody}`
  - keyed with `MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET`
- Supported `status` values:
  - `processing`
  - `succeeded`
  - `failed`
  - `refunded`

### Pillar 10 launch audit

- Endpoint: `/api/materials-tools/launch-audit`
- Reports:
  - Supabase configuration state
  - proof-bucket and payment-webhook readiness
  - live or seeded counts for listings, suppliers, orders, bookings, and co-op commitments
  - donation lifecycle operational events
  - payment webhook receipt log
  - launch health summary metrics for failed payments, pending refunds, active ICIP reviews, and rate-limited writes

### App-wide Supabase Direction

- `src/app/lib/apiClient.ts` now auto-attaches wallet/JWT auth headers for browser requests.
- `src/app/lib/supabase/*` provides reusable browser/server Supabase clients.
- Existing pillar libs can move endpoint-by-endpoint from external API calls to Supabase-backed routes without breaking current UI flows.
- Internal Next/Supabase API mode is the default app path. Keep `NEXT_PUBLIC_USE_APP_API=true` for normal local and production app runs.
- Only set `NEXT_PUBLIC_API_BASE_URL` when you intentionally want the frontend to target an external API host instead of the in-app `/api` routes.
- Mock/demo fallback is now opt-in. Leave `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=false` and `NEXT_PUBLIC_ALLOW_TOURISM_MOCKS=false` for production-like runs.

### Env quick map

- Production-required core:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `INDIGENA_WALLET_SESSION_SECRET`
- Production-required Pillar 9:
  - `ADVOCACY_PAYMENT_WEBHOOK_SECRET`
  - `SUPABASE_ADVOCACY_EVIDENCE_BUCKET`
  - `ADVOCACY_ADMIN_WALLETS`
  - `ADVOCACY_LEGAL_OPS_WALLETS`
- Optional integrations / alternate routing:
  - `NEXT_PUBLIC_API_BASE_URL`
- Local dev / demo-only:
  - `ADVOCACY_ALLOW_DEV_HEADER_AUTH`
  - `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK`
  - `NEXT_PUBLIC_ALLOW_TOURISM_MOCKS`

## Production Launch Checklist

- Environment and routing
  - Set all `Production-required core` variables
  - Set all `Production-required Pillar 9` variables if Pillar 9 payments, uploads, or legal ops are live
  - Keep `NEXT_PUBLIC_USE_APP_API=true`
  - Leave `NEXT_PUBLIC_API_BASE_URL` unset unless you intentionally run a separate backend

- Mock and demo safety
  - Keep `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=false`
  - Keep `NEXT_PUBLIC_ALLOW_TOURISM_MOCKS=false`
  - Keep `ADVOCACY_ALLOW_DEV_HEADER_AUTH=false`

- Database rollout
  - Apply the core platform migrations first
  - Apply shared marketplace ops
  - Apply the active pillar migrations you want live
  - Apply `20260313_materials_tools_ops.sql` after `20260313_materials_tools_core.sql`
  - Apply `20260313_materials_tools_seed.sql` after the Pillar 10 core + ops migrations if you want Pillar 10 starter content immediately

- Wallet and auth
  - Verify `/api/auth/wallet/*` works end-to-end in the target environment
  - Verify protected actions open the shared wallet flow and recover cleanly
  - Verify admin/legal wallet allowlists are set for Pillar 9 operations

- Smoke verification
  - Run `npx playwright test tests/e2e/pillars-smoke.spec.ts --workers=1`
  - Run `npx playwright test tests/e2e/wallet-required-prompts.spec.ts --workers=1`
  - Run `npx playwright test tests/e2e/advocacy-legal-ops.spec.ts --workers=2`
  - Run `npm run build`

- Runtime monitoring
  - Check `/api/health` after deploy
  - Confirm `productionLike` is `true` before public launch
  - Review Pillar 9 audit surfaces:
    - `/advocacy-legal/dashboard/legal-professional`
    - `/advocacy-legal/dashboard/audit-center`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
