-- BLINDAGEM DE PRODUÇÃO: ROW LEVEL SECURITY (RLS) DEFINITIVO
-- Este script garante o isolamento total entre diferentes barbearias (Tenants)

-- 1. Limpeza de políticas genéricas anteriores (se existirem)
DROP POLICY IF EXISTS "Admins editam serviços" ON services;
DROP POLICY IF EXISTS "Admins editam sua equipe" ON professionals;
DROP POLICY IF EXISTS "Admin gerencia comandas" ON appointments;
DROP POLICY IF EXISTS "Admin gerencia suas transações" ON transactions;
DROP POLICY IF EXISTS "Dono pode editar sua barbearia" ON tenants;

-- ==========================================
-- POLÍTICAS PARA TENANTS (BARBEARIAS)
-- ==========================================
-- Apenas o dono (owner_id) pode atualizar dados da sua própria barbearia
CREATE POLICY "Dono gerencia seu Tenant" ON tenants
FOR ALL USING (auth.uid() = owner_id);

-- ==========================================
-- POLÍTICAS PARA SERVIÇOS E PROFISSIONAIS
-- ==========================================
-- Leitura: Pública para clientes verem na vitrine
-- Escrita: Somente se o usuário logado for o dono do tenant associado
CREATE POLICY "Dono gerencia seus Serviços" ON services
FOR ALL USING (
  tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

CREATE POLICY "Dono gerencia sua Equipe" ON professionals
FOR ALL USING (
  tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- ==========================================
-- POLÍTICAS PARA AGENDAMENTOS (APPOINTMENTS)
-- ==========================================
-- Inserção: Pública (Clientes agendando na vitrine)
-- Leitura/Edição: Somente o dono da barbearia
CREATE POLICY "Dono gerencia seus Agendamentos" ON appointments
FOR ALL USING (
  tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- ==========================================
-- POLÍTICAS PARA TRANSAÇÕES (FINANCEIRO)
-- ==========================================
-- Tranca Total: Apenas o dono pode ver ou criar transações na sua barbearia
-- Ninguém de fora ou cliente tem acesso a nada aqui.
CREATE POLICY "Dono gerencia suas Finanças" ON transactions
FOR ALL USING (
  tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- ==========================================
-- SEGURANÇA EXTRA: SUPER ADMIN
-- ==========================================
-- Permitir que o Super Admin (definido na tabela profiles) veja tudo (opcional para suporte)
-- CREATE POLICY "Super Admin vê tudo" ON tenants FOR SELECT USING (
--   (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
-- );

COMMIT;
