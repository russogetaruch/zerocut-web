-- Tabela de Serviços da Barbearia
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 45,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Serviços são visíveis para clientes na vitrine" ON services FOR SELECT USING (true);
-- Simplificando inserção para modo dev/admin
CREATE POLICY "Admins editam serviços" ON services FOR ALL USING (true);


-- Tabela Principal de Agendamentos (Comandas)
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE RESTRICT,
  
  -- Dados do Cliente (Por hora, string livre como era no app mobile)
  client_name text NOT NULL,
  client_phone text,
  
  -- Controle de Horário
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  
  -- Status: WAITING, INCOMING, SCHEDULED, COMPLETED, CANCELED
  status text NOT NULL DEFAULT 'SCHEDULED',
  
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- Cliente web pode criar agendamentos na loja
CREATE POLICY "Clientes inserem agendamentos" ON appointments FOR INSERT WITH CHECK (true);
-- Admin da barbearia pode ver e gerenciar os agendamentos dele
CREATE POLICY "Admin gerencia comandas" ON appointments FOR ALL USING (true);
