ALTER TABLE public.media_jobs
  ADD COLUMN IF NOT EXISTS script_type text,
  ADD COLUMN IF NOT EXISTS analysis_report jsonb,
  ADD COLUMN IF NOT EXISTS analysis_quality_score numeric,
  ADD COLUMN IF NOT EXISTS veo3_prompt text,
  ADD COLUMN IF NOT EXISTS veo3_metadata jsonb,
  ADD COLUMN IF NOT EXISTS veo3_video_url text;