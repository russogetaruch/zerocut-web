-- CRM INTELLIGENCE VIEW (Fase Final de Otimização)
-- Consolida os dados dos clientes diretamente no banco de dados.
-- Otimiza a performance: Agregação O(1) no frontend, O(log N) no backend.

CREATE OR REPLACE VIEW client_insights AS
SELECT 
    tenant_id,
    client_name,
    client_phone,
    COUNT(id) as total_visits,
    MAX(created_at) as last_visit,
    -- Status Logics
    CASE 
        WHEN COUNT(id) >= 10 THEN 'VIP'
        WHEN MAX(created_at) > now() - interval '30 days' THEN 'ATIVO'
        ELSE 'EM_RISCO'
    END as status,
    -- Loyalty Points (Ex: a cada 10 visitas completa 1 ciclo)
    (COUNT(id) % 10) as loyalty_points
FROM appointments
WHERE status = 'COMPLETED'
GROUP BY tenant_id, client_name, client_phone;

-- Comentário para documentação
COMMENT ON VIEW client_insights IS 'Agregação de comportamento do cliente para o CRM do ZERØCUT';
