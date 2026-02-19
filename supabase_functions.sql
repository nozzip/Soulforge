-- 1. Function to get distinct filter values (for Sidebar)
DROP FUNCTION IF EXISTS get_catalog_filter_values();

CREATE OR REPLACE FUNCTION get_catalog_filter_values()
RETURNS TABLE (
  categories text[],
  sizes text[],
  designers text[],
  creature_types text[],
  weapons text[],
  universes text[]
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT
    ARRAY(SELECT DISTINCT trim(category) FROM products WHERE category IS NOT NULL AND category != '' ORDER BY 1),
    ARRAY(SELECT DISTINCT trim(s) FROM products, unnest(string_to_array(size, '/')) AS s WHERE size IS NOT NULL AND trim(s) != '' ORDER BY 1),
    ARRAY(SELECT DISTINCT trim(designer) FROM products WHERE designer IS NOT NULL AND designer != '' ORDER BY 1),
    ARRAY(SELECT DISTINCT trim(creature_type) FROM products WHERE creature_type IS NOT NULL AND creature_type != '' ORDER BY 1),
    ARRAY(SELECT DISTINCT trim(w) FROM products, unnest(string_to_array(weapon, '/')) AS w WHERE weapon IS NOT NULL AND trim(w) != '' ORDER BY 1),
    ARRAY(SELECT DISTINCT trim(universe) FROM products WHERE universe IS NOT NULL AND universe != '' ORDER BY 1);
END;
$$;

-- 2. Function to get catalog items (Grouped by Set + Search inside Sets)
DROP FUNCTION IF EXISTS get_catalog_items(integer,integer,text,text[],text[],text[],text[],text[],text);
DROP FUNCTION IF EXISTS get_catalog_items(integer,integer,text,text[],text[],text[],text[],text[],text[],text);

CREATE OR REPLACE FUNCTION get_catalog_items(
  page_number int,
  page_size int,
  search_query text DEFAULT '',
  filter_categories text[] DEFAULT '{}',
  filter_sizes text[] DEFAULT '{}',
  filter_designers text[] DEFAULT '{}',
  filter_creature_types text[] DEFAULT '{}',
  filter_weapons text[] DEFAULT '{}',
  filter_universes text[] DEFAULT '{}',
  sort_option text DEFAULT 'newest'
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image text,
  category text,
  size text,
  designer text,
  creature_type text,
  weapon text,
  set_name text,
  universe text,
  mime_type text,
  created_at timestamptz,
  rating numeric,
  reviews_count bigint,
  is_set_header boolean,
  member_count bigint
) LANGUAGE plpgsql AS $$
DECLARE
  offset_val int;
BEGIN
  offset_val := (page_number - 1) * page_size;

  RETURN QUERY
  WITH filtered_products AS (
    SELECT 
        p.*,
        -- Image Fallback Logic: Use 'image' column, if null/empty try first element of 'images' if it existed, otherwise image_url
        COALESCE(
            NULLIF(p.image, ''), 
            NULLIF(p.image_url, ''),
            '/placeholder.jpg'
        ) as final_image
    FROM products p
    WHERE
      -- Search
      (search_query = '' OR
       p.name ILIKE '%' || search_query || '%' OR
       p.category ILIKE '%' || search_query || '%' OR
       p.designer ILIKE '%' || search_query || '%' OR
       p.creature_type ILIKE '%' || search_query || '%' OR
       p.weapon ILIKE '%' || search_query || '%' OR
       p.set_name ILIKE '%' || search_query || '%' OR
       p.universe ILIKE '%' || search_query || '%')
      AND
      -- Categories
      (array_length(filter_categories, 1) IS NULL OR trim(p.category) = ANY(filter_categories))
      AND
      -- Sizes
      (array_length(filter_sizes, 1) IS NULL OR 
       EXISTS (SELECT 1 FROM unnest(filter_sizes) s WHERE p.size ILIKE '%' || s || '%'))
      AND
      -- Designers
      (array_length(filter_designers, 1) IS NULL OR trim(p.designer) = ANY(filter_designers))
      AND
      -- Creature Types
      (array_length(filter_creature_types, 1) IS NULL OR trim(p.creature_type) = ANY(filter_creature_types))
      AND
      -- Weapons
      (array_length(filter_weapons, 1) IS NULL OR 
       EXISTS (SELECT 1 FROM unnest(filter_weapons) w WHERE p.weapon ILIKE '%' || w || '%'))
      AND
      -- Universes
      (array_length(filter_universes, 1) IS NULL OR trim(p.universe) = ANY(filter_universes))
  ),
  grouped_items AS (
    SELECT
      COALESCE(
        (SELECT p2.id FROM products p2 WHERE p2.set_name = fp.set_name AND p2.name ILIKE '%Header%' LIMIT 1),
        FIRST_VALUE(fp.id) OVER (PARTITION BY fp.set_name ORDER BY fp.id)
      ) as representative_id,
      fp.set_name,
      COUNT(*) OVER (PARTITION BY fp.set_name) as set_count
    FROM filtered_products fp
    WHERE fp.set_name IS NOT NULL AND fp.set_name != 'Sin set'
    
    UNION ALL
    
    SELECT
      fp.id as representative_id,
      NULL::text as set_name,
      1 as set_count
    FROM filtered_products fp
    WHERE fp.set_name IS NULL OR fp.set_name = 'Sin set'
  ),
  unique_groups AS (
    SELECT DISTINCT
      gi.representative_id,
      gi.set_name,
      gi.set_count
    FROM grouped_items gi
  )
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    -- Apply fallback image logic using alias p
    COALESCE(
        NULLIF(p.image, ''), 
        NULLIF(p.image_url, ''),
        '/placeholder.jpg'
    ) as image,
    p.category,
    p.size,
    p.designer,
    p.creature_type,
    p.weapon,
    p.set_name,
    p.universe,
    p.mime_type,
    p.created_at,
    COALESCE(AVG(pr.rating), 0) as rating,
    COUNT(pr.id) as reviews_count,
    CASE WHEN p.set_name IS NOT NULL AND p.set_name != 'Sin set' THEN true ELSE false END as is_set_header,
    ug.set_count as member_count
  FROM unique_groups ug
  JOIN products p ON p.id = ug.representative_id
  LEFT JOIN product_reviews pr ON pr.product_id = p.id
  GROUP BY p.id, ug.set_count
  ORDER BY
    CASE WHEN sort_option = 'price-asc' THEN p.price END ASC,
    CASE WHEN sort_option = 'price-desc' THEN p.price END DESC,
    CASE WHEN sort_option = 'newest' THEN p.created_at END DESC,
    p.id ASC
  LIMIT page_size OFFSET offset_val;
END;
$$;

-- 3. Function to get COUNT (for pagination)
DROP FUNCTION IF EXISTS get_catalog_items_count(text,text[],text[],text[],text[],text[]);
DROP FUNCTION IF EXISTS get_catalog_items_count(text,text[],text[],text[],text[],text[],text[]);

CREATE OR REPLACE FUNCTION get_catalog_items_count(
  search_query text DEFAULT '',
  filter_categories text[] DEFAULT '{}',
  filter_sizes text[] DEFAULT '{}',
  filter_designers text[] DEFAULT '{}',
  filter_creature_types text[] DEFAULT '{}',
  filter_weapons text[] DEFAULT '{}',
  filter_universes text[] DEFAULT '{}'
)
RETURNS bigint LANGUAGE plpgsql AS $$
BEGIN
  RETURN (
    WITH filtered_products AS (
      SELECT *
      FROM products p
      WHERE
        (search_query = '' OR
         p.name ILIKE '%' || search_query || '%' OR
         p.category ILIKE '%' || search_query || '%' OR
         p.designer ILIKE '%' || search_query || '%' OR
         p.creature_type ILIKE '%' || search_query || '%' OR
         p.weapon ILIKE '%' || search_query || '%' OR
         p.set_name ILIKE '%' || search_query || '%' OR
         p.universe ILIKE '%' || search_query || '%')
        AND
        (array_length(filter_categories, 1) IS NULL OR trim(p.category) = ANY(filter_categories))
        AND
        (array_length(filter_sizes, 1) IS NULL OR 
         EXISTS (SELECT 1 FROM unnest(filter_sizes) s WHERE p.size ILIKE '%' || s || '%'))
        AND
        (array_length(filter_designers, 1) IS NULL OR trim(p.designer) = ANY(filter_designers))
        AND
        (array_length(filter_creature_types, 1) IS NULL OR trim(p.creature_type) = ANY(filter_creature_types))
        AND
        (array_length(filter_weapons, 1) IS NULL OR 
         EXISTS (SELECT 1 FROM unnest(filter_weapons) w WHERE p.weapon ILIKE '%' || w || '%'))
        AND
        (array_length(filter_universes, 1) IS NULL OR trim(p.universe) = ANY(filter_universes))
    ),
    grouped_items AS (
      SELECT
        COALESCE(
          (SELECT p2.id FROM products p2 WHERE p2.set_name = fp.set_name AND p2.name ILIKE '%Header%' LIMIT 1),
          FIRST_VALUE(fp.id) OVER (PARTITION BY fp.set_name ORDER BY fp.id)
        ) as representative_id
      FROM filtered_products fp
      WHERE fp.set_name IS NOT NULL AND fp.set_name != 'Sin set'
      
      UNION ALL
      
      SELECT
        fp.id as representative_id
      FROM filtered_products fp
      WHERE fp.set_name IS NULL OR fp.set_name = 'Sin set'
    ),
    unique_groups AS (
      SELECT DISTINCT representative_id FROM grouped_items
    )
    SELECT COUNT(*) FROM unique_groups
  );
END;
$$;

