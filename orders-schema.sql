-- ============================================
-- MEJORAS EN TABLA DE ÓRDENES (PEDIDOS)
-- ============================================

-- Agregar columnas adicionales a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS contract_number TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_dni TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear índice para búsquedas por número de contrato
CREATE INDEX IF NOT EXISTS idx_orders_contract_number ON orders(contract_number);

-- Crear índice para búsquedas por teléfono
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_timestamp ON orders;
CREATE TRIGGER update_orders_timestamp
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Función para generar número de contrato único
DROP FUNCTION IF EXISTS generate_contract_number() CASCADE;

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contract_number IS NULL THEN
        NEW.contract_number := 'RF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar contract_number automáticamente
DROP TRIGGER IF EXISTS set_contract_number ON orders;
CREATE TRIGGER set_contract_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_contract_number();

-- Políticas RLS para orders (usuarios solo ven sus propios pedidos)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vista para el panel de admin (todos los pedidos)
CREATE OR REPLACE VIEW admin_orders_view AS
SELECT 
    o.*,
    json_agg(
        json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'name', oi.name,
            'quantity', oi.quantity,
            'price_gp', oi.price_gp,
            'image', oi.image
        )
    ) as order_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Vista para estadísticas de pedidos
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
    status,
    COUNT(*) as count,
    SUM(total_gp) as total_value
FROM orders
GROUP BY status;

-- Mensaje de confirmación
SELECT '✅ Tabla de órdenes mejorada correctamente' as status;
