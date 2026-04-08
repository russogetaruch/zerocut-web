-- ADIÇÃO DE GESTÃO DE COMISSÃO
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS commission_percentage numeric(5,2) DEFAULT 0.00;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Seed de teste para comissões (Opcional)
-- UPDATE professionals SET commission_percentage = 30.00 WHERE specialty LIKE '%Master%';
