CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'email');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql security definer;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
