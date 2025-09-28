-- Fix database constraints for coffee_links table
-- This script removes the unique constraint on user_id and allows multiple coffee links per user

-- Drop the unique constraint on user_id if it exists
DO $$ 
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'coffee_links_user_id_key' 
        AND table_name = 'coffee_links'
    ) THEN
        ALTER TABLE coffee_links DROP CONSTRAINT coffee_links_user_id_key;
        RAISE NOTICE 'Dropped unique constraint on user_id';
    ELSE
        RAISE NOTICE 'No unique constraint found on user_id';
    END IF;
END $$;

-- Ensure the coffee_link field remains unique (this is what we want)
-- This constraint should already exist, but let's make sure
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'coffee_links_coffee_link_key' 
        AND table_name = 'coffee_links'
    ) THEN
        ALTER TABLE coffee_links ADD CONSTRAINT coffee_links_coffee_link_key UNIQUE (coffee_link);
        RAISE NOTICE 'Added unique constraint on coffee_link';
    ELSE
        RAISE NOTICE 'Unique constraint on coffee_link already exists';
    END IF;
END $$;

-- Update RLS policies to allow multiple coffee links per user
DROP POLICY IF EXISTS "Users can view their own coffee links" ON coffee_links;
DROP POLICY IF EXISTS "Users can insert their own coffee links" ON coffee_links;
DROP POLICY IF EXISTS "Users can update their own coffee links" ON coffee_links;

-- Create updated RLS policies
CREATE POLICY "Users can view their own coffee links" ON coffee_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coffee links" ON coffee_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coffee links" ON coffee_links
  FOR UPDATE USING (auth.uid() = user_id);

-- Keep the policy for viewing active coffee links
CREATE POLICY "Anyone can view active coffee links" ON coffee_links
  FOR SELECT USING (is_active = true);

-- Add a policy to allow users to delete their own coffee links
CREATE POLICY "Users can delete their own coffee links" ON coffee_links
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the changes
SELECT 
    constraint_name, 
    constraint_type, 
    table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'coffee_links' 
ORDER BY constraint_name;
