
-- Add verified flag to catalog_products
ALTER TABLE public.catalog_products
ADD COLUMN is_verified boolean NOT NULL DEFAULT false;

-- Mark existing products as verified (they came from the API)
UPDATE public.catalog_products SET is_verified = true WHERE source_platform = 'tiktok_shop';

-- Create user_products table for tracking affiliations
CREATE TABLE public.user_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  catalog_product_id uuid NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  affiliate_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, catalog_product_id)
);

-- Enable RLS
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own affiliated products"
ON public.user_products FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can affiliate to products"
ON public.user_products FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their affiliations"
ON public.user_products FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
