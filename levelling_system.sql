-- Add XP columns to profiles if they don't exist (they seem to exist based on previous checks, but let's be safe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp') THEN
        ALTER TABLE profiles ADD COLUMN xp INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
        ALTER TABLE profiles ADD COLUMN level INT DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'title') THEN
        ALTER TABLE profiles ADD COLUMN title TEXT DEFAULT 'Novice Adventurer';
    END IF;
END $$;

-- Create forum_likes table
CREATE TABLE IF NOT EXISTS forum_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Ensure a like target is specified
    CONSTRAINT like_target_check CHECK (
        (thread_id IS NOT NULL AND post_id IS NULL) OR 
        (thread_id IS NULL AND post_id IS NOT NULL)
    ),
    -- Ensure unique likes per user per target
    CONSTRAINT unique_thread_like UNIQUE (user_id, thread_id),
    CONSTRAINT unique_post_like UNIQUE (user_id, post_id)
);

-- Add likes_count and xp_milestone to forum_threads and forum_posts
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'likes_count') THEN
        ALTER TABLE forum_threads ADD COLUMN likes_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'xp_milestone') THEN
        ALTER TABLE forum_threads ADD COLUMN xp_milestone INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_posts' AND column_name = 'likes_count') THEN
        ALTER TABLE forum_posts ADD COLUMN likes_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_posts' AND column_name = 'xp_milestone') THEN
        ALTER TABLE forum_posts ADD COLUMN xp_milestone INT DEFAULT 0;
    END IF;
END $$;

-- Enable RLS on forum_likes
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- Policies for forum_likes
CREATE POLICY "Public read likes" ON forum_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON forum_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own likes" ON forum_likes FOR DELETE USING (auth.uid() = user_id);

-- Function to add XP and handle leveling
CREATE OR REPLACE FUNCTION add_xp(target_user_id UUID, xp_amount INT) 
RETURNS VOID AS $$
DECLARE
    current_xp INT;
    current_level INT;
    new_xp INT;
    new_level INT;
    new_title TEXT;
BEGIN
    -- Get current stats
    SELECT xp, level INTO current_xp, current_level FROM profiles WHERE id = target_user_id;
    
    -- Initialize if null
    IF current_xp IS NULL THEN current_xp := 0; END IF;
    IF current_level IS NULL THEN current_level := 1; END IF;

    new_xp := current_xp + xp_amount;
    
    -- Calculate level: Level L requires L * 1000 accumulated XP total? 
    -- User said: "Level 1 -> 2: 1000 XP (Total 1000 for Lvl 2)", "Level 2 -> 3: 2000 XP (Total 3000 for Lvl 3)"
    -- This is a triangular number sequence * 1000. 
    -- Total XP for Level L = 1000 * L * (L-1) / 2 ?
    -- Let's stick to the user's specific text: "XP Formula: Level * 1000 required for next level."
    -- Means to get from L to L+1, you need L*1000 *additional* XP.
    -- Cumulative XP for Level N = Sum(i=1 to N-1) of (i * 1000).
    -- Inverse is tricky in SQL without a loop or complex math, but let's approximate or just loop since max level is 20.
    
    -- Simple Loop to find level
    new_level := 1;
    WHILE new_level < 20 LOOP
        IF new_xp >= (new_level * 1000) THEN
            new_xp := new_xp - (new_level * 1000); -- Wait, user implies total accumulated?
            -- "Total XP for Level 3: 3000 XP" -> Lvl 1->2 (1000) + Lvl 2->3 (2000) = 3000.
            -- So yes, cumulative.
            -- Let's recalculate the cumulative threshold for next level.
            -- Threshold for L+1 = Threshold for L + (L * 1000).
        ELSE
            EXIT; 
        END IF;
        
        -- Actually, since we are storing "Total XP" in the profile, we need to compare Total XP against thresholds.
        -- Threshold to reach Level 2: 1000.
        -- Threshold to reach Level 3: 3000 (1000 + 2000).
        -- Threshold to reach Level 4: 6000 (3000 + 3000).
        -- Threshold to reach Level N: (N-1)*N/2 * 1000.
    END LOOP;

    -- Let's do it properly:
    -- Level N requires Total XP >= 1000 * (N-1) * N / 2.
    -- We want to find the largest N such that Total XP >= Formula(N).
    -- Reverse: 2 * XP / 1000 >= N(N-1) ~= N^2.
    -- N ~= Sqrt(2 * XP / 1000).
    
    new_level := floor((1 + sqrt(1 + 8 * (new_xp::float / 1000))) / 2);
    IF new_level < 1 THEN new_level := 1; END IF;
    IF new_level > 20 THEN new_level := 20; END IF;

    -- Determine Title
    IF new_level >= 20 THEN new_title := 'Epic Legend';
    ELSIF new_level >= 15 THEN new_title := 'Master of the Realm';
    ELSIF new_level >= 10 THEN new_title := 'Veteran Hero';
    ELSIF new_level >= 5 THEN new_title := 'Dungeon Explorer';
    ELSE new_title := 'Novice Adventurer';
    END IF;

    -- Update Profile
    UPDATE profiles 
    SET xp = new_xp, 
        level = new_level, 
        title = new_title 
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger: Award XP for creating a thread (20 XP)
CREATE OR REPLACE FUNCTION trigger_thread_xp() RETURNS TRIGGER AS $$
BEGIN
    PERFORM add_xp(NEW.author_id, 20);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER award_thread_xp
AFTER INSERT ON forum_threads
FOR EACH ROW EXECUTE FUNCTION trigger_thread_xp();


-- Trigger: Award XP for creating a post/reply (10 XP)
CREATE OR REPLACE FUNCTION trigger_post_xp() RETURNS TRIGGER AS $$
BEGIN
    PERFORM add_xp(NEW.author_id, 10);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER award_post_xp
AFTER INSERT ON forum_posts
FOR EACH ROW EXECUTE FUNCTION trigger_post_xp();


-- Trigger: Handle new like (Increment count, check milestone, award XP)
CREATE OR REPLACE FUNCTION trigger_new_like() RETURNS TRIGGER AS $$
DECLARE
    target_author_id UUID;
    current_likes INT;
    current_milestone INT;
BEGIN
    IF NEW.thread_id IS NOT NULL THEN
        -- It's a thread like
        UPDATE forum_threads 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.thread_id
        RETURNING author_id, likes_count, xp_milestone INTO target_author_id, current_likes, current_milestone;
        
        -- Check milestone (Every 3 likes)
        IF current_likes >= (current_milestone + 1) * 3 THEN
             PERFORM add_xp(target_author_id, 10);
             UPDATE forum_threads SET xp_milestone = xp_milestone + 1 WHERE id = NEW.thread_id;
        END IF;
        
    ELSIF NEW.post_id IS NOT NULL THEN
        -- It's a post like
        UPDATE forum_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id
        RETURNING author_id, likes_count, xp_milestone INTO target_author_id, current_likes, current_milestone;
        
        -- Check milestone
        IF current_likes >= (current_milestone + 1) * 3 THEN
             PERFORM add_xp(target_author_id, 10);
             UPDATE forum_posts SET xp_milestone = xp_milestone + 1 WHERE id = NEW.post_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_like
AFTER INSERT ON forum_likes
FOR EACH ROW EXECUTE FUNCTION trigger_new_like();


-- Trigger: Handle unlike (Decrement count)
CREATE OR REPLACE FUNCTION trigger_unlike() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.thread_id IS NOT NULL THEN
        UPDATE forum_threads SET likes_count = likes_count - 1 WHERE id = OLD.thread_id;
    ELSIF OLD.post_id IS NOT NULL THEN
        UPDATE forum_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_unlike
AFTER DELETE ON forum_likes
FOR EACH ROW EXECUTE FUNCTION trigger_unlike();
