-- Create roulette_settings table
CREATE TABLE public.roulette_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spin_limit_type text NOT NULL CHECK (spin_limit_type IN ('unlimited', 'once_per_day', 'once_per_week', 'once_lifetime')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default configuration (unlimited spins)
INSERT INTO public.roulette_settings (spin_limit_type, is_active) 
VALUES ('unlimited', true);

-- Enable RLS
ALTER TABLE public.roulette_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage settings" ON public.roulette_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view settings" ON public.roulette_settings
  FOR SELECT USING (true);

-- Create function to check if user can spin
CREATE OR REPLACE FUNCTION public.can_user_spin(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _settings record;
  _last_spin timestamptz;
BEGIN
  -- Get active settings
  SELECT * INTO _settings 
  FROM public.roulette_settings 
  WHERE is_active = true 
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no settings or unlimited, allow spin
  IF _settings IS NULL OR _settings.spin_limit_type = 'unlimited' THEN
    RETURN json_build_object(
      'can_spin', true,
      'reason', null,
      'next_available', null
    );
  END IF;
  
  -- Get user's last spin
  SELECT MAX(won_at) INTO _last_spin
  FROM public.user_prizes
  WHERE user_id = _user_id;
  
  -- If never spun, allow spin
  IF _last_spin IS NULL THEN
    RETURN json_build_object(
      'can_spin', true,
      'reason', null,
      'next_available', null
    );
  END IF;
  
  -- Check once_lifetime rule
  IF _settings.spin_limit_type = 'once_lifetime' THEN
    RETURN json_build_object(
      'can_spin', false,
      'reason', 'Você já utilizou seu único giro disponível.',
      'next_available', null
    );
  END IF;
  
  -- Check once_per_day rule
  IF _settings.spin_limit_type = 'once_per_day' THEN
    IF DATE(_last_spin) = CURRENT_DATE THEN
      RETURN json_build_object(
        'can_spin', false,
        'reason', 'Você já girou hoje. Volte amanhã!',
        'next_available', (CURRENT_DATE + INTERVAL '1 day')::text
      );
    ELSE
      RETURN json_build_object(
        'can_spin', true,
        'reason', null,
        'next_available', null
      );
    END IF;
  END IF;
  
  -- Check once_per_week rule
  IF _settings.spin_limit_type = 'once_per_week' THEN
    IF _last_spin >= date_trunc('week', CURRENT_DATE) THEN
      RETURN json_build_object(
        'can_spin', false,
        'reason', 'Você já girou esta semana. Volte na próxima semana!',
        'next_available', (date_trunc('week', CURRENT_DATE) + INTERVAL '1 week')::text
      );
    ELSE
      RETURN json_build_object(
        'can_spin', true,
        'reason', null,
        'next_available', null
      );
    END IF;
  END IF;
  
  -- Default: allow spin
  RETURN json_build_object(
    'can_spin', true,
    'reason', null,
    'next_available', null
  );
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_roulette_settings_updated_at
BEFORE UPDATE ON public.roulette_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();