-- Como você ainda não tem a interface "Cadastrar Serviço" pronta, rode isso no SQL do Supabase.
-- Ele vai descobrir a sua primeira Barbearia (Tenant) e injetar 3 serviços matadores para você testar a dinâmica financeira!

DO $$
DECLARE
    tenant_record uuid;
BEGIN
    SELECT id INTO tenant_record FROM tenants ORDER BY created_at DESC LIMIT 1;
    
    IF tenant_record IS NOT NULL THEN
        -- Limpa se por um milagre houver algo lá
        DELETE FROM services WHERE tenant_id = tenant_record;
        
        -- Insere os dados Reais da Vitrine
        INSERT INTO services (tenant_id, name, duration_minutes, price) VALUES
        (tenant_record, 'Corte C-Level (Tesoura & Navalha)', 45, 65.00),
        (tenant_record, 'Degradê Fio-a-Fio (Skin Fade)', 45, 45.00),
        (tenant_record, 'BarboTerapia Ouro (Toalha Quente)', 30, 40.00);
    END IF;
END $$;
