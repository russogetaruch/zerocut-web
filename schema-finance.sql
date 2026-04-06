-- SCHEMA FINANCEIRO: FLUXO DE CAIXA E COMANDAS
-- Rodar este SQL para ativar a gestão de dinheiro e fiado

-- 1. Criar a tabela de Transações (Entradas e Saídas)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo: INCOME (Receita), EXPENSE (Gasto)
  type text NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  
  -- Detalhes do Pagamento
  amount numeric(10,2) NOT NULL DEFAULT 0.00,
  payment_method text NOT NULL CHECK (payment_method IN ('PIX', 'CARTAO', 'DINHEIRO', 'FIADO', 'OUTRO')),
  
  -- Categorias: SERVICO, PRODUTO, ALUGUEL, LUZ, AGUA, SALARIO, etc
  category text NOT NULL DEFAULT 'SERVICO',
  description text,
  
  -- Vinculo opcional com Agendamento (Comanda)
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia suas transações" ON transactions FOR ALL USING (true);

-- 2. View rápida para saldo total diário (Para o Command Center)
-- (Pode ser consultado via RPC ou Select direto)
-- SELECT SUM(amount) FILTER (WHERE type = 'INCOME') - SUM(amount) FILTER (WHERE type = 'EXPENSE') as balance
-- FROM transactions WHERE tenant_id = '...' AND created_at::date = current_date;
