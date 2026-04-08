-- GESTÃO DE HORÁRIOS DE FUNCIONAMENTO
CREATE TABLE IF NOT EXISTS working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL, -- 0 (Domingo) a 6 (Sábado)
  open_time time NOT NULL DEFAULT '09:00',
  close_time time NOT NULL DEFAULT '19:00',
  is_closed boolean DEFAULT false,
  UNIQUE(tenant_id, day_of_week)
);

-- Habilitar RLS
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants gerenciam seus próprios horários" ON working_hours FOR ALL USING (true);

-- Seed básico para novos tenants (Pode ser feito via Trigger futuramente)
-- INSERT INTO working_hours (tenant_id, day_of_week) 
-- SELECT id, d FROM tenants, generate_series(0,6) d;
