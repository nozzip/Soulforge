-- ==============================================================================
-- CORRECCIÓN DE PERSISTENCIA Y SEGURIDAD PARA PRODUCTOS
-- ==============================================================================

-- 1. Habilitar Row Level Security (RLS) en la tabla products
-- Esto asegura que ninguna operación se permita a menos que haya una política explicita.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Política de LECTURA PÚBLICA
-- Todo el mundo (autenticado o anónimo) puede ver los productos.
DROP POLICY IF EXISTS "Public Read Access" ON products;
CREATE POLICY "Public Read Access" 
ON products FOR SELECT 
USING (true);

-- 3. Política de ACTUALIZACIÓN para ADMINS
-- Solo los usuarios que estén en la tabla 'admin_users' pueden modificar productos.
-- Esto protege contra usuarios logueados que no son administradores.
DROP POLICY IF EXISTS "Admin Update Access" ON products;
CREATE POLICY "Admin Update Access" 
ON products FOR UPDATE 
USING (
  auth.uid() IN (SELECT user_id FROM admin_users)
)
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- 4. Política de INSERCIÓN para ADMINS
DROP POLICY IF EXISTS "Admin Insert Access" ON products;
CREATE POLICY "Admin Insert Access" 
ON products FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- 5. Política de ELIMINACIÓN para ADMINS
DROP POLICY IF EXISTS "Admin Delete Access" ON products;
CREATE POLICY "Admin Delete Access" 
ON products FOR DELETE 
USING (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Confirmación
SELECT '✅ Políticas de seguridad aplicadas correctamente: Solo Admins pueden editar.' as status;
