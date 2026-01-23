-- =====================================================
-- ADMIN ROLE VIA USER METADATA
-- =====================================================

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
            FALSE
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar política de eliminación de reviews para usar la función
DROP POLICY IF EXISTS "Service role can delete reviews" ON product_reviews;
CREATE POLICY "Admins can delete reviews" ON product_reviews
    FOR DELETE USING (is_admin());

-- Actualizar política de actualización de orders para admins
DROP POLICY IF EXISTS "Service role can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (is_admin());

-- =====================================================
-- PARA HACER UN USUARIO ADMIN:
-- Ve a Authentication > Users en Supabase
-- Click en el usuario > Edit User
-- En "User Metadata" añade: {"role": "admin"}
-- =====================================================
