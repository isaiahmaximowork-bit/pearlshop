
ALTER TABLE public.user_products
  ADD COLUMN category text DEFAULT '';

-- Allow users to update their own products (for category/affiliate_url changes)
CREATE POLICY "Users can update their own products"
  ON public.user_products
  FOR UPDATE
  USING (auth.uid() = user_id);
