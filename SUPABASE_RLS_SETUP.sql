-- INSTRUCCIONES DE CONFIGURACIÓN DE SUPABASE (CORREGIDO PARA ADMINS)
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.

-- Tienes una tabla 'admin_users', así que usaremos esa para verificar permisos.

-- 1. Eliminar políticas anteriores si existen (opcional, para limpiar)
-- drop policy if exists "Enable delete for authenticated users (orders)" on "public"."orders";
-- drop policy if exists "Enable delete for authenticated users (items)" on "public"."order_items";

-- 2. Habilitar eliminación en la tabla 'orders' SOLO si el usuario está en 'admin_users'
create policy "Enable delete for admins only (orders)" 
on "public"."orders" 
for delete 
to authenticated 
using (
  auth.uid() in (select user_id from public.admin_users)
);

-- 3. Habilitar eliminación en la tabla 'order_items' SOLO si el usuario está en 'admin_users'
create policy "Enable delete for admins only (items)" 
on "public"."order_items" 
for delete 
to authenticated 
using (
  auth.uid() in (select user_id from public.admin_users)
);

-- 4. Asegurarse que la tabla 'products' también esté protegida (si no lo está ya)
-- create policy "Enable modification for admins only (products)" 
-- on "public"."products" 
-- for all 
-- to authenticated 
-- using (
--   auth.uid() in (select user_id from public.admin_users)
-- );
