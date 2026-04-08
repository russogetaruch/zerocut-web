-- BLOG INSTITUCIONAL
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_url text,
  author_name text DEFAULT 'Equipe ZERØCUT',
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Recriar policies de forma segura (idempotente)
DROP POLICY IF EXISTS "Leitura pública para posts" ON posts;
DROP POLICY IF EXISTS "Admin gerencia posts" ON posts;

CREATE POLICY "Leitura pública para posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Admin gerencia posts" ON posts FOR ALL USING (true);
