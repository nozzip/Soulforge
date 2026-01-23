-- =====================================================
-- RESINFORGE SUPABASE MIGRATIONS
-- Run these in the Supabase SQL Editor
-- =====================================================

-- 1. Product Reviews Table
-- Stores user reviews for products with optional images
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    image TEXT, -- Base64 or URL of user-uploaded image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster product lookups
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reviews
CREATE POLICY "Anyone can read reviews" ON product_reviews
    FOR SELECT USING (true);

-- Allow anyone to insert reviews (for now, could be restricted to authenticated users)
CREATE POLICY "Anyone can insert reviews" ON product_reviews
    FOR INSERT WITH CHECK (true);

-- Only allow deletion by service role (admin)
CREATE POLICY "Service role can delete reviews" ON product_reviews
    FOR DELETE USING (auth.role() = 'service_role');

-- =====================================================

-- 2. Wishlists Table
-- Persistent wishlists for authenticated users
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wishlist
CREATE POLICY "Users can view own wishlist" ON wishlists
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to own wishlist" ON wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own wishlist
CREATE POLICY "Users can remove from own wishlist" ON wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================

-- 3. Saved Addresses Table
-- Stores shipping addresses for faster checkout
CREATE TABLE IF NOT EXISTS saved_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- e.g., "Casa", "Trabajo"
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    zip TEXT NOT NULL,
    realm TEXT NOT NULL DEFAULT 'north',
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON saved_addresses(user_id);

-- Enable RLS
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own addresses
CREATE POLICY "Users can view own addresses" ON saved_addresses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add their own addresses
CREATE POLICY "Users can add own addresses" ON saved_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses" ON saved_addresses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses" ON saved_addresses
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================

-- 4. Update Orders Table (if not exists)
-- Make sure orders table has the right structure
-- Note: This assumes the orders table already exists from previous setup

-- Add user_id column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add phone column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'phone'
    ) THEN
        ALTER TABLE orders ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Enable RLS on orders if not already
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Anyone can insert orders (guest checkout allowed)
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Only service role can update orders (admin)
DROP POLICY IF EXISTS "Service role can update orders" ON orders;
CREATE POLICY "Service role can update orders" ON orders
    FOR UPDATE USING (auth.role() = 'service_role');

-- =====================================================

-- 5. Index for order_items (if not exists)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- DONE! Your ResinForge database is ready.
-- =====================================================
