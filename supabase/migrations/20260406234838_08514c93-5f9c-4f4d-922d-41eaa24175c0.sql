CREATE TABLE IF NOT EXISTS public.catalog_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  image_url TEXT,
  source_platform TEXT NOT NULL DEFAULT 'tiktok_shop',
  shop_cipher TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_platform, product_id)
);

ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only service role can access catalog products" ON public.catalog_products;
CREATE POLICY "Only service role can access catalog products"
ON public.catalog_products
FOR ALL
USING (false)
WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_catalog_products_source_platform ON public.catalog_products(source_platform);
CREATE INDEX IF NOT EXISTS idx_catalog_products_shop_cipher ON public.catalog_products(shop_cipher);
CREATE INDEX IF NOT EXISTS idx_catalog_products_status ON public.catalog_products(status);
CREATE INDEX IF NOT EXISTS idx_catalog_products_product_name ON public.catalog_products(product_name);

CREATE OR REPLACE FUNCTION public.set_catalog_products_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_catalog_products_updated_at ON public.catalog_products;
CREATE TRIGGER set_catalog_products_updated_at
BEFORE UPDATE ON public.catalog_products
FOR EACH ROW
EXECUTE FUNCTION public.set_catalog_products_updated_at();