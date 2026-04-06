-- SCHEMA DE PLANOS DE PREÇO (MARKETPLACE)
-- Rodar este SQL para habilitar a gestão de planos editável pelo Super Admin

CREATE TABLE IF NOT EXISTS pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  description text,
  features text[] DEFAULT '{}',
  is_popular boolean DEFAULT false,
  button_text text DEFAULT 'Começar Agora',
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública para planos" ON pricing_plans FOR SELECT USING (true);
CREATE POLICY "Super Admin gerencia planos" ON pricing_plans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Popular dados iniciais (Padrão de Mercado)
INSERT INTO pricing_plans (name, price, description, features, is_popular, button_text)
VALUES 
('Starter', 49.90, 'Essencial para barbeiros autônomos.', ARRAY['Agenda Ilimitada', 'CRM Básico', 'Vitrine Digital', 'Checkout Manual'], false, 'Começar Starter'),
('Pro (Recomendado)', 99.90, 'O poder da automação para sua barbearia.', ARRAY['Tudo no Starter', 'Notificações Real-time', 'Pagamento PIX Integrado', 'Gestão de Financeiro'], true, 'Virar Pro'),
('Master / Rede', 199.90, 'Para barbearias com grandes equipes.', ARRAY['Tudo no Pro', 'Múltiplos Barbeiros', 'Relatórios Avançados', 'Suporte VIP 24h'], false, 'Falar com Consultor')
ON CONFLICT DO NOTHING;
