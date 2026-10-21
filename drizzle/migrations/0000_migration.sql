CREATE TABLE public.services (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, price numeric(14,2), currency text NOT NULL DEFAULT '', available boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors read services" ON public.services FOR SELECT TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
CREATE TABLE public.admin_login_attempts (key text PRIMARY KEY, attempts integer NOT NULL DEFAULT 0, window_start timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.admin_login_attempts TO service_role;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.consume_admin_attempt(attempt_key text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE count_attempts integer;
BEGIN
INSERT INTO public.admin_login_attempts AS a (key, attempts, window_start) VALUES (attempt_key, 1, now()) ON CONFLICT (key) DO UPDATE SET attempts = CASE WHEN a.window_start < now() - interval '15 minutes' THEN 1 ELSE a.attempts + 1 END, window_start = CASE WHEN a.window_start < now() - interval '15 minutes' THEN now() ELSE a.window_start END RETURNING attempts INTO count_attempts;
RETURN count_attempts <= 10;
END; $$;
REVOKE ALL ON FUNCTION public.consume_admin_attempt(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_admin_attempt(text) TO service_role;
CREATE TABLE public.account_availability (key text PRIMARY KEY CHECK (char_length(key) BETWEEN 1 AND 300), available boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.account_availability TO anon, authenticated;
GRANT ALL ON public.account_availability TO service_role;
ALTER TABLE public.account_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors read account availability" ON public.account_availability FOR SELECT TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.account_availability;