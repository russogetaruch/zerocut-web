-- VITRINE DINÂMICA: PERSONALIZAÇÃO DE LANDING PAGE
-- Rodar este SQL para permitir edição de visual pelo Admin

-- 1. Adicionar colunas de personalização na tabela de tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS tagline text DEFAULT 'Atendimento de Elite',
ADD COLUMN IF NOT EXISTS description text DEFAULT 'Excelência em cada corte.';

-- 2. Atualizar barbearia01 com alguns dados reais para teste
UPDATE tenants 
SET 
  tagline = 'O Corte Perfeito para o Homem de Atitude',
  description = 'Referência em barbearia clássica e moderna no centro da cidade.',
  banner_url = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80'
WHERE slug = 'barbearia01';
