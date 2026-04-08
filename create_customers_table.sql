-- 1. Adicionar Objetivo de Fidelidade nos Tenants (Padrão 15)
ALTER TABLE tenants ADD COLUMN loyalty_target_cuts integer DEFAULT 15;

-- 2. Tabela de Clientes para Fidelidade
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  name text NOT NULL,
  phone text NOT NULL, -- Telefone/WhatsApp como chave de CRM
  birthday date,
  
  loyalty_points integer DEFAULT 0, -- Cortes realizados
  total_spent numeric(10,2) DEFAULT 0.00,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Um cliente por telefone por barbearia
  UNIQUE(tenant_id, phone)
);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clientes inserem seus próprios dados" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin gerencia sua carteira" ON customers FOR ALL USING (true);

-- 3. Trigger para Atualizar Atualizado Em
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
