ALTER TABLE creator_profile_offerings
  ADD COLUMN IF NOT EXISTS cta_preset text,
  ADD COLUMN IF NOT EXISTS gallery_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS launch_window_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS launch_window_ends_at timestamptz;

UPDATE creator_profile_offerings
SET
  cta_preset = COALESCE(cta_preset, CASE cta_mode
    WHEN 'buy' THEN 'collect-now'
    WHEN 'book' THEN 'book-now'
    WHEN 'enroll' THEN 'enroll-now'
    WHEN 'quote' THEN 'request-quote'
    WHEN 'message' THEN 'message-first'
    ELSE 'collect-now'
  END),
  gallery_order = COALESCE(gallery_order, '[]'::jsonb)
WHERE cta_preset IS NULL OR gallery_order IS NULL;
