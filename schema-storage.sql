-- COMANDOS PARA INICIALIZAR O STORAGE (BUCKET DE AVATARES)
-- OBS: Se o SQL der erro de permissão, você terá que criar o bucket 'avatars' manualmente no Painel do Supabase.

-- 1. Criar o Bucket 'avatars'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir que QUALQUER UM veja as fotos (Leitura Pública)
CREATE POLICY "Avatares são públicos" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 3. Permitir que usuários autenticados (Admin) subam fotos
CREATE POLICY "Admins podem subir fotos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- 4. Permitir que o dono apague ou atualize fotos
CREATE POLICY "Admins gerenciam fotos" ON storage.objects
FOR ALL USING (bucket_id = 'avatars');
