alter table if exists public.materials_tools_suppliers
add column if not exists supplier_actor_id text;
