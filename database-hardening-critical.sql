-- 1. Trava de Duplicidade (Prevenir double booking)
-- Garante que um profissional não tenha dois agendamentos no mesmo horário e dia na mesma loja
-- Script Idempotente: Verifica se a constraint já existe antes de tentar criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_professional_time') THEN
        ALTER TABLE appointments 
        ADD CONSTRAINT unique_professional_time 
        UNIQUE (tenant_id, professional_id, appointment_date, appointment_time);
    END IF;
END $$;


-- 2. Função Atômica de Finalização de Elite (V2 - Blindada)
-- Busca o preço real do serviço no banco, ignorando fraudes no frontend.
CREATE OR REPLACE FUNCTION finalize_appointment_with_transaction(
  p_appointment_id uuid,
  p_tenant_id uuid,
  p_payment_method text,
  p_category text DEFAULT 'SERVICO',
  p_description text DEFAULT 'Finalização de Atendimento'
)
RETURNS void AS $$
DECLARE
  v_real_amount numeric;
  v_service_id uuid;
BEGIN
  -- 2.1 Localiza o serviço e o preço real vinculado ao agendamento
  SELECT service_id INTO v_service_id FROM appointments WHERE id = p_appointment_id;
  SELECT price INTO v_real_amount FROM services WHERE id = v_service_id;

  -- 2.2 Se o preço não for encontrado (segurança extra), cancela a operação
  IF v_real_amount IS NULL THEN
    RAISE EXCEPTION 'Preço do serviço não localizado. Operação abortada.';
  END IF;

  -- 2.3 Atualiza o agendamento
  UPDATE appointments 
  SET status = 'COMPLETED'
  WHERE id = p_appointment_id AND tenant_id = p_tenant_id;

  -- 2.4 Insere a transação financeira com o VALOR REAL DO BANCO
  INSERT INTO transactions (
    tenant_id,
    appointment_id,
    type,
    amount,
    payment_method,
    category,
    description
  ) VALUES (
    p_tenant_id,
    p_appointment_id,
    'INCOME',
    v_real_amount,
    p_payment_method,
    p_category,
    p_description || ' (Valor Verificado via DB)'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

