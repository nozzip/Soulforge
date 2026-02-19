-- Create guilds table
CREATE TABLE IF NOT EXISTS guilds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES profiles(id) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Ensure leader can only lead one guild (handled by logic, but DB constraint is good too potentially, 
    -- though a user might leave and create another. Let's keep it flexible but maybe standard 1-to-1 leader relationship?)
    -- For now, unique constraint on leader_id ensures one guild per leader? 
    -- User requirement: "Can create their own Guild". Usually implies one.
    CONSTRAINT unique_leader UNIQUE (leader_id)
);

-- Create guild_members table (handles membership and applications)
CREATE TABLE IF NOT EXISTS guild_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('leader', 'officer', 'member')) DEFAULT 'member',
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    joined_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure unique membership per user (can only be in one guild or pending in one?)
    -- Typically users can apply to multiple but only be in one.
    -- To simplify: User can only have one active membership or pending application at a time?
    -- Or unique (user_id, guild_id) prevents duplicate apps to SAME guild.
    CONSTRAINT unique_guild_membership UNIQUE (user_id, guild_id)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_guild_members_user ON guild_members(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild ON guild_members(guild_id);

-- Enable RLS
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;

-- Policies for Guilds
-- Everyone can view guilds
CREATE POLICY "Public items are visible to everyone" ON guilds FOR SELECT USING (true);

-- Authenticated users can create a guild (Logic for Level 5 check will be in app or function, 
-- but we can add a basic check here? No, cross-table check in policy is expensive/complex sometimes. 
-- Let's stick to 'Authenticated' for now and enforce logic in API/UI or a Trigger).
CREATE POLICY "Users can create guilds" ON guilds FOR INSERT WITH CHECK (auth.uid() = leader_id);

-- Leaders/Admins can update their guild
CREATE POLICY "Leaders can update own guild" ON guilds FOR UPDATE 
USING (auth.uid() = leader_id OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Leaders/Admins can delete their guild
CREATE POLICY "Leaders can delete own guild" ON guilds FOR DELETE 
USING (auth.uid() = leader_id OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Policies for Members
-- Everyone can view members (to see who is in a guild)
CREATE POLICY "Public members visible" ON guild_members FOR SELECT USING (true);

-- Users can insert their own application (pending)
CREATE POLICY "Users can apply" ON guild_members FOR INSERT 
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Leaders can update status (Accept/Reject)
CREATE POLICY "Leaders can manage members" ON guild_members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM guilds 
        WHERE id = guild_members.guild_id AND leader_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Users can leave (delete their own row) or Leaders can kick
CREATE POLICY "Manage membership" ON guild_members FOR DELETE
USING (
    auth.uid() = user_id -- Leave
    OR 
    EXISTS ( -- Kick
        SELECT 1 FROM guilds 
        WHERE id = guild_members.guild_id AND leader_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Add 'guild_id' to profiles? 
-- The user request says "En el perfil en lugar de Facción va a estar Guild".
-- It's better to Query the guild_members table to find the guild, OR denormalize for easier access.
-- Given Supabase/PostgREST, querying relations is easy. 
-- However, `profiles` table having `guild_id` might make `auth.users` select easier?
-- Let's stick to `guild_members` as the source of truth to avoid sync issues.
-- We can create a View if needed, or just select `guild_members(guild_id, guilds(name))` in the query.

