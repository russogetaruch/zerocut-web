-- ATUALIZAÇÃO: VINCULAR AGENDAMENTOS AOS PROFISSIONAIS
-- Rodar este SQL para que cada corte tenha um dono (Barbeiro)

-- 1. Adicionar a coluna de Profissional na tabela de agendamentos
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES professionals(id) ON DELETE SET NULL;

-- 2. (Opcional) Tabela de Horário de Funcionamento por Loja
CREATE TABLE IF NOT EXISTS working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL, -- 0 (Domingo) a 6 (Sábado)
  opening_time time NOT NULL DEFAULT '08:00',
  closing_time time NOT NULL DEFAULT '19:00',
  is_closed boolean DEFAULT false,
  UNIQUE(tenant_id, day_of_week)
);

-- Seed básico de funcionamento (Segunda a Sábado das 08h às 19h) para a barbearia01
DO $$
DECLARE
    tenant_record uuid;
BEGIN
    SELECT id INTO tenant_record FROM tenants WHERE slug = 'barbearia01' LIMIT 1;
    
    IF tenant_record IS NOT NULL THEN
        -- Insere horários padrão
        INSERT INTO working_hours (tenant_id, day_of_week, opening_time, closing_time)
        VALUES 
        (tenant_record, 1, '08:00', '19:00'),
        (tenant_record, 2, '08:00', '19:00'),
        (tenant_record, 3, '08:00', '19:00'),
        (tenant_record, 4, '08:00', '19:00'),
        (tenant_record, 5, '08:00', '19:00'),
        (tenant_record, 6, '08:00', '19:00')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
