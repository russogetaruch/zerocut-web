-- CONTROLE DE STATUS DO TENANT (SUPER ADMIN)
-- Permite suspender ou ativar barbearias globalmente

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Comentário para o Super Admin identificar lojas inadimplentes
COMMENT ON COLUMN tenants.is_active IS 'Define se a barbearia tem acesso ao painel (controle de assinatura)';
