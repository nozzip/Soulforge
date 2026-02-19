-- MIGRATION: Align products table with CSV structure
-- Renombra 'title' a 'universe' y agrega columnas faltantes.

DO $$ 
BEGIN 
    -- 1. Renombrar title a universe si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'title') THEN
        ALTER TABLE products RENAME COLUMN title TO universe;
    END IF;

    -- 2. Agregar mime_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'mime_type') THEN
        ALTER TABLE products ADD COLUMN mime_type text;
    END IF;

    -- 3. Asegurar que gallery_images existe como array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gallery_images') THEN
        ALTER TABLE products ADD COLUMN gallery_images text[] DEFAULT '{}';
    END IF;

    -- 4. Asegurar que price y created_at existen (usualmente ya están)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
        ALTER TABLE products ADD COLUMN price numeric DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;

END $$;
