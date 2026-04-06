-- RODAR NO SQL EDITOR DO SUPABASE
-- Isso habilita a transmissão em tempo real para a tabela de agendamentos

alter publication supabase_realtime add table appointments;
