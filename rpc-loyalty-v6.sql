-- FUNÇÃO ATÔMICA V6: FINANCEIRO + FIDELIDADE + ANALYTICS (FEES)
-- Rodar os comandos abaixo antes de criar a função se as colunas não existirem:
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fee_amount numeric(10,2) DEFAULT 0.00;
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS net_amount numeric(10,2) DEFAULT 0.00;
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS card_brand text;

CREATE OR REPLACE FUNCTION finalize_appointment_with_transaction_v6(
  p_appointment_id uuid,
  p_tenant_id uuid,
  p_payment_method text,
  p_card_brand text DEFAULT NULL,
  p_fee_amount numeric DEFAULT 0,
  p_net_amount numeric DEFAULT 0,
  p_description text DEFAULT 'Finalização de Atendimento'
)
RETURNS void AS $$
DECLARE
  v_real_amount numeric;
  v_service_id uuid;
  v_client_phone text;
  v_client_name text;
  v_mapped_method text;
BEGIN
  -- 1. Dados do Agendamento
  SELECT service_id, client_phone, client_name 
  INTO v_service_id, v_client_phone, v_client_name 
  FROM appointments 
  WHERE id = p_appointment_id AND tenant_id = p_tenant_id;

  -- 2. Preço Real do Serviço (Para Auditoria)
  SELECT price INTO v_real_amount FROM services WHERE id = v_service_id;

  IF v_real_amount IS NULL THEN
    -- Fallback se o serviço sumiu, usamos o net + fee
    v_real_amount := p_net_amount + p_fee_amount;
  END IF;

  -- 3. Mapear Método para o Check Constraint da Tabela
  v_mapped_method := p_payment_method;
  IF p_payment_method IN ('CREDITO', 'DEBITO') THEN
    v_mapped_method := 'CARTAO';
  END IF;

  -- 4. Atualizar Status do Agendamento
  UPDATE appointments 
  SET status = 'COMPLETED'
  WHERE id = p_appointment_id AND tenant_id = p_tenant_id;

  -- 5. Registrar Transação Financeira Analítica
  INSERT INTO transactions (
    tenant_id,
    appointment_id,
    type,
    amount,
    payment_method,
    category,
    description,
    fee_amount,
    net_amount,
    card_brand
  ) VALUES (
    p_tenant_id,
    p_appointment_id,
    'INCOME',
    v_real_amount,
    v_mapped_method,
    'SERVICO',
    p_description || ' (Cálculo Automático)',
    p_fee_amount,
    p_net_amount,
    p_card_brand
  );

  -- 6. Fidelidade (Auto-Upsert)
  IF v_client_phone IS NOT NULL AND v_client_phone != 'Não Informado' THEN
    INSERT INTO customers (tenant_id, phone, name, loyalty_points, total_spent)
    VALUES (p_tenant_id, v_client_phone, v_client_name, 1, v_real_amount)
    ON CONFLICT (tenant_id, phone) DO UPDATE
    SET 
        loyalty_points = customers.loyalty_points + 1,
        total_spent = customers.total_spent + EXCLUDED.total_spent,
        updated_at = now();
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
