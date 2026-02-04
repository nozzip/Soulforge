-- ============================================
-- MEJORAS DE SEGURIDAD MÁXIMA
-- ============================================

-- 1. TABLA DE CARRITO CON VALIDACIÓN Estricta
-- ============================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_category TEXT,
  product_scale TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 100),
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- POLÍTICAS RLS MEJORADAS para cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- SELECT: Solo ve sus propios items
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
CREATE POLICY "Users can view their own cart items" ON cart_items
FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Valida que el user_id coincide con el usuario autenticado
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
CREATE POLICY "Users can insert their own cart items" ON cart_items
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND auth.role() = 'authenticated'
);

-- UPDATE: Solo puede actualizar sus items y no cambiar el user_id
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
CREATE POLICY "Users can update their own cart items" ON cart_items
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND auth.uid() = (SELECT user_id FROM cart_items WHERE id = cart_items.id)
);

-- DELETE: Solo puede borrar sus items
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
CREATE POLICY "Users can delete their own cart items" ON cart_items
FOR DELETE USING (auth.uid() = user_id);


-- 2. BUCKET DE IMÁGENES CON LÍMITE DE TASA
-- ============================================

-- Crear bucket para imágenes (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Tabla para rate limiting de uploads
CREATE TABLE IF NOT EXISTS upload_rate_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para limpieza de registros antiguos
CREATE INDEX IF NOT EXISTS idx_upload_rate_limits_window ON upload_rate_limits(window_start);

-- Función para verificar y actualizar rate limit
CREATE OR REPLACE FUNCTION check_upload_rate_limit(p_user_id UUID, p_max_uploads INTEGER DEFAULT 10, p_window_hours INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_record upload_rate_limits%ROWTYPE;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := NOW() - (p_window_hours || ' hours')::INTERVAL;
  
  -- Buscar registro existente
  SELECT * INTO v_record 
  FROM upload_rate_limits 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Primera vez que sube
    INSERT INTO upload_rate_limits (user_id, upload_count, window_start, last_upload)
    VALUES (p_user_id, 1, NOW(), NOW());
    RETURN TRUE;
  END IF;
  
  -- Si la ventana de tiempo expiró, reiniciar
  IF v_record.window_start < v_window_start THEN
    UPDATE upload_rate_limits 
    SET upload_count = 1, window_start = NOW(), last_upload = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- Verificar límite
  IF v_record.upload_count >= p_max_uploads THEN
    RETURN FALSE;
  END IF;
  
  -- Incrementar contador
  UPDATE upload_rate_limits 
  SET upload_count = upload_count + 1, last_upload = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpiar registros antiguos (más de 24 horas)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM upload_rate_limits 
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. POLÍTICAS DE STORAGE MEJORADAS
-- ============================================

-- SELECT: Cualquiera puede ver imágenes públicas
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- INSERT: Solo usuarios autenticados con rate limit y validación MIME
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND (storage.extension(name) = ANY(ARRAY['jpg', 'jpeg', 'png', 'webp']))
  AND check_upload_rate_limit(auth.uid(), 10, 1)  -- Máximo 10 uploads por hora
);

-- UPDATE: Solo el dueño puede modificar sus archivos
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products' 
  AND owner = auth.uid()
);

-- DELETE: Solo el dueño puede borrar sus archivos
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products' 
  AND owner = auth.uid()
);


-- 4. VALIDACIÓN DE TIPO MIME EN BACKEND
-- ============================================

-- Función para validar tipos MIME permitidos
CREATE OR REPLACE FUNCTION validate_mime_type()
RETURNS TRIGGER AS $$
DECLARE
  allowed_types TEXT[] := ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  file_mime_type TEXT;
BEGIN
  -- Extraer MIME type del metadata
  file_mime_type := NEW.metadata->>'mimetype';
  
  IF file_mime_type IS NULL OR NOT (file_mime_type = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'Tipo de archivo no permitido. Solo se permiten: jpeg, png, webp';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para validar MIME type en uploads
DROP TRIGGER IF EXISTS validate_mime_type_trigger ON storage.objects;
CREATE TRIGGER validate_mime_type_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'products')
  EXECUTE FUNCTION validate_mime_type();


-- 5. AUDITORÍA DE SUBIDAS
-- ============================================

CREATE TABLE IF NOT EXISTS upload_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Índice para búsquedas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_upload_audit_user_id ON upload_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_audit_uploaded_at ON upload_audit_log(uploaded_at);

-- Función para registrar uploads
CREATE OR REPLACE FUNCTION log_upload()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO upload_audit_log (user_id, filename, file_size, mime_type, uploaded_at)
  VALUES (auth.uid(), NEW.name, NEW.metadata->>'size', NEW.metadata->>'mimetype', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auditoría
DROP TRIGGER IF EXISTS upload_audit_trigger ON storage.objects;
CREATE TRIGGER upload_audit_trigger
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'products')
  EXECUTE FUNCTION log_upload();


-- 6. ACTUALIZACIÓN DE TABLA DE PRODUCTOS
-- ============================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS set_name TEXT,
ADD COLUMN IF NOT EXISTS designer TEXT,
ADD COLUMN IF NOT EXISTS creature_type TEXT,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS weapon TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS checked BOOLEAN DEFAULT FALSE;

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_products_size ON products(size);
CREATE INDEX IF NOT EXISTS idx_products_grade ON products(grade);
CREATE INDEX IF NOT EXISTS idx_products_set_name ON products(set_name);
CREATE INDEX IF NOT EXISTS idx_products_designer ON products(designer);
CREATE INDEX IF NOT EXISTS idx_products_creature_type ON products(creature_type);
CREATE INDEX IF NOT EXISTS idx_products_checked ON products(checked);

-- Constraint para grade
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_grade'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT valid_grade 
        CHECK (grade IN ('C', 'R', 'L'));
    END IF;
END $$;


-- 7. VISTAS PARA MONITOREO
-- ============================================

-- Vista para ver intentos de rate limiting
CREATE OR REPLACE VIEW upload_rate_status AS
SELECT 
  user_id,
  upload_count,
  window_start,
  last_upload,
  (window_start + INTERVAL '1 hour') - NOW() as time_until_reset
FROM upload_rate_limits
ORDER BY upload_count DESC;


-- Mensaje de confirmación
SELECT '✅ Todas las mejoras de seguridad han sido aplicadas correctamente' as status;
