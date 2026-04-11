
-- Add access_code and is_public columns to stores
ALTER TABLE public.stores 
ADD COLUMN access_code TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 5),
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;
