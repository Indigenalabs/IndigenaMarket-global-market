# Enterprise Admin Deployment Note

Apply this migration set before enabling the hardened partnerships admin surface in production:

- `C:\Users\tari1\.vscode\indigena-backend\global-market\supabase\migrations\20260321_phase3_enterprise_inquiries.sql`

This migration adds:

- `enterprise_contract_access_logs`
- `enterprise_pipeline_settings`
- enterprise inquiry contract storage fields

After the migration is applied:

1. Ensure the operator accessing admin partnerships has an allowed admin role in `user_profiles.role`.
2. Ensure the client sends `x-admin-signed: true` only for real admin sessions.
3. If using private contract storage, confirm the storage bucket configured by `SUPABASE_ENTERPRISE_CONTRACT_BUCKET` exists.
