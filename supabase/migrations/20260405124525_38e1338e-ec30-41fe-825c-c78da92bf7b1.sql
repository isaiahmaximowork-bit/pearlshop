CREATE TABLE public.tiktok_shop_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_key TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tiktok_shop_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access tokens"
ON public.tiktok_shop_tokens
FOR ALL
USING (false)
WITH CHECK (false);