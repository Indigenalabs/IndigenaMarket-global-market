alter table if exists public.creator_profiles
add column if not exists shipping_settings jsonb not null default '{}'::jsonb;

update public.creator_profiles
set shipping_settings = jsonb_build_object(
  'domesticProfile', 'Domestic (US): $10 flat + $2 per lb',
  'internationalProfile', 'International: $25 flat + $5 per lb',
  'defaultPackage', 'Default box: 12 x 12 x 12 in, 5 lbs',
  'handlingTime', '2 business days',
  'integrations', jsonb_build_array(
    jsonb_build_object('label', 'ShipStation', 'detail', 'Connect label generation and fulfillment workflows.', 'connected', false),
    jsonb_build_object('label', 'EasyParcel', 'detail', 'Route regional delivery options for Asia-Pacific orders.', 'connected', false),
    jsonb_build_object('label', 'Studio defaults', 'detail', 'Handling time, packaging dimensions, and fragile-item rules.', 'connected', true)
  )
)
where shipping_settings = '{}'::jsonb or shipping_settings is null;
