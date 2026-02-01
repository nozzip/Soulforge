-- Crear bucket para imágenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Políticas de acceso (RLS)
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated'
);

-- Update tabla de productos para incluir nuevos campos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS set_name TEXT,
ADD COLUMN IF NOT EXISTS designer TEXT,
ADD COLUMN IF NOT EXISTS creature_type TEXT,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS weapon TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT, -- Cambiado de INTEGER a TEXT para C, R, L
ADD COLUMN IF NOT EXISTS image_url TEXT, -- URL pública de Storage
ADD COLUMN IF NOT EXISTS checked BOOLEAN DEFAULT FALSE; -- Para control de aprobación

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_size ON products(size);
CREATE INDEX IF NOT EXISTS idx_products_grade ON products(grade);
CREATE INDEX IF NOT EXISTS idx_products_set_name ON products(set_name);
CREATE INDEX IF NOT EXISTS idx_products_designer ON products(designer);
CREATE INDEX IF NOT EXISTS idx_products_creature_type ON products(creature_type);
CREATE INDEX IF NOT EXISTS idx_products_checked ON products(checked);

-- Constraint para grade (solo permite C, R, L)
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