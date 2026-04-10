CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, avatar_id, tiktok_handle)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_id', 'strawberry'),
    COALESCE(NEW.raw_user_meta_data->>'tiktok_handle', '')
  );
  RETURN NEW;
END;
$$;