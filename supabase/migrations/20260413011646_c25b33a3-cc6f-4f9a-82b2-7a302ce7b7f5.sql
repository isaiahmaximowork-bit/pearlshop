
ALTER TABLE public.stores
  ADD COLUMN footer_bg_color text DEFAULT '#1a1a1a',
  ADD COLUMN footer_text_color text DEFAULT '#ffffff',
  ADD COLUMN footer_logo_color text DEFAULT '#ffffff',
  ADD COLUMN instagram_url text DEFAULT '',
  ADD COLUMN tiktok_url text DEFAULT '',
  ADD COLUMN youtube_url text DEFAULT '',
  ADD COLUMN support_email text DEFAULT '';
