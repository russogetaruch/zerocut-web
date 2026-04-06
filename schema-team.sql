-- Infraestrutura para Gestão de Equipe (Profissionais)

CREATE TABLE professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  specialty text,
  avatar_url text, -- Armazena a URL da imagem (por enquanto pravatar ou externo)
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais visíveis para todos na vitrine" ON professionals FOR SELECT USING (true);
CREATE POLICY "Admins editam sua equipe" ON professionals FOR ALL USING (true);

-- Habilitar Realtime para a equipe (Opcional, mas útil)
alter publication supabase_realtime add table professionals;

-- Semente Inicial (Seed) para o Barbeiro Chefe da barbearia01
DO $$
DECLARE
    tenant_record uuid;
BEGIN
    SELECT id INTO tenant_record FROM tenants WHERE slug = 'barbearia01' LIMIT 1;
    
    IF tenant_record IS NOT NULL THEN
        -- Limpa se houver algo
        DELETE FROM professionals WHERE tenant_id = tenant_record;
        
        -- Insere os Barbeiros Reais
        INSERT INTO professionals (tenant_id, name, specialty, avatar_url) VALUES
        (tenant_record, 'André Master', 'Especialista em Degradê', 'https://i.pravatar.cc/150?u=andre'),
        (tenant_record, 'Lucas Navalha', 'BarboTerapia & Visagismo', 'https://i.pravatar.cc/150?u=lucas'),
        (tenant_record, 'Caio Tesoura', 'Cortes Clássicos', 'https://i.pravatar.cc/150?u=caio');
    END IF;
END $$;
