CREATE POLICY "Allow public read access to catalog products"
ON public.catalog_products
FOR SELECT
USING (true);