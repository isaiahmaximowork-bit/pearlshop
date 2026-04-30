ALTER TABLE public.media_jobs
  ADD COLUMN IF NOT EXISTS product_description text,
  ADD COLUMN IF NOT EXISTS product_category text,
  ADD COLUMN IF NOT EXISTS product_image_url text,
  ADD COLUMN IF NOT EXISTS product_mention text,
  ADD COLUMN IF NOT EXISTS clothing_description text,
  ADD COLUMN IF NOT EXISTS framing_type text;