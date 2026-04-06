-- Tabela de Perfis Base (Estendendo a autenticação do Supabase)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text CHECK (role IN ('super_admin', 'admin', 'client')) DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar leitura pública para RLS depois (simplificado para desenvolvimento inicial)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura irrestrita para perfis" ON profiles FOR SELECT USING (true);
CREATE POLICY "Donos podem editar seu perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Gatilho para preencher o Profile automaticamente quando alguém criar conta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'admin' -- Define todo novo login como dono de barbearia inicialmente para testes
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Tabela de Lojistas / Tenants (As Barbearias)
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer um pode ver as barbearias (vitrine publica)" ON tenants FOR SELECT USING (true);
CREATE POLICY "Admins podem criar barbearias" ON tenants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Dono pode editar sua barbearia" ON tenants FOR UPDATE USING (auth.uid() = owner_id);
