-- Tabelas de Infraestrutura para o Módulo de Chat em Tempo Real

-- Tabela Raiz de Salas de Chat (Um chat único entre um cliente e uma unidade)
CREATE TABLE chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_phone text,
  status text NOT NULL DEFAULT 'open', -- open, closed
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela de Mensagens Específicas
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL, -- 'client' ou 'admin'
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitando Segurança RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para Inserção Livre (MVP) e Leitura
CREATE POLICY "Livre acesso a chats para dev" ON chats FOR ALL USING (true);
CREATE POLICY "Livre acesso a messages para dev" ON messages FOR ALL USING (true);

-- LIGANDO O MOTOR EM TEMPO REAL DO SUPABASE!
-- Isso permite o Front-End escutar mudanças nessas tabelas instantaneamente:
alter publication supabase_realtime add table chats;
alter publication supabase_realtime add table messages;
