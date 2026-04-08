-- FUNÇÃO ATÔMICA V5: FINANCEIRO + FIDELIDADE AUTO-CADASTRO
CREATE OR REPLACE FUNCTION finalize_appointment_with_transaction_v5(
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
BEGIN
  -- 1. Dados do Agendamento
  SELECT service_id, client_phone, client_name 
  INTO v_service_id, v_client_phone, v_client_name 
  FROM appointments 
  WHERE id = p_appointment_id AND tenant_id = p_tenant_id;

  -- 2. Preço Real do Serviço
  SELECT price INTO v_real_amount FROM services WHERE id = v_service_id;

  IF v_real_amount IS NULL THEN
    RAISE EXCEPTION 'Erro: Serviço não localizado.';
  END IF;

  -- 3. Atualizar Status do Agendamento
  UPDATE appointments 
  SET status = 'COMPLETED'
  WHERE id = p_appointment_id AND tenant_id = p_tenant_id;

  -- 4. Registrar Transação Financeira
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
    'SERVICO',
    p_description || ' (Auto-Clube)'
  );

  -- 5. Lógica de Fidelidade (Auto-Upsert)
  -- Se houver telefone, o cliente ganha pontos. Se não existir, criamos o registro básico.
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
