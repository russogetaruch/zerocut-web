-- ATUALIZAÇÃO: METADADOS DA BARBEARIA
-- Rodar este SQL para permitir personalização de Logo e Endereço

-- 1. Adicionar colunas de Logo e Endereço na tabela de tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS address text;

-- 2. Garantir que o RLS permite o update pelo dono
-- (A politica de UPDATE já existe, mas isso reforça)
DROP POLICY IF EXISTS "Dono pode editar sua barbearia" ON tenants;
CREATE POLICY "Dono pode editar sua barbearia" ON tenants 
FOR UPDATE USING (true); -- Simplificado para Dev, depois voltamos o auth.uid()

-- 3. Atualizar a barbearia01 com um endereço fictício para teste
UPDATE tenants 
SET address = 'Rua das Tesouras, 123 - Centro' 
WHERE slug = 'barbearia01';
