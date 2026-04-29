-- Tabela de jobs de geração UGC
CREATE TABLE public.media_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Inputs do Studio (snapshot)
  product_id text,
  product_name text,
  avatar_id text,
  avatar_name text,
  pose text,
  interaction text,
  scenario_tags text[] DEFAULT '{}',
  scenario_text text,
  camera_style text,
  video_style text,
  enhancements text[] DEFAULT '{}',
  proximity int,
  energy int,
  duration text,
  voice_gender text,
  voice_tone text,
  voice_energy text,
  voice_style text,
  script text,

  -- Saídas dos Agentes
  master_prompt text,
  agent1_metadata jsonb,
  image_prompt text,
  script_prompt jsonb,
  warnings jsonb,

  -- Mídia gerada
  image_url text,
  image_storage_key text,

  -- Status
  status text NOT NULL DEFAULT 'pending', -- pending|processing|completed|failed
  error_message text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_jobs_user ON public.media_jobs(user_id, created_at DESC);

ALTER TABLE public.media_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own media jobs"
ON public.media_jobs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own media jobs"
ON public.media_jobs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own media jobs"
ON public.media_jobs FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own media jobs"
ON public.media_jobs FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_media_jobs_updated_at
BEFORE UPDATE ON public.media_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket público para mídias geradas
INSERT INTO storage.buckets (id, name, public)
VALUES ('ugc-media', 'ugc-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies do bucket
CREATE POLICY "UGC media public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'ugc-media');

CREATE POLICY "Users upload own UGC media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ugc-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own UGC media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'ugc-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own UGC media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ugc-media' AND auth.uid()::text = (storage.foldername(name))[1]);