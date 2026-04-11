ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS original_price numeric,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS is_on_sale boolean DEFAULT false;