-- Fix user_settings foreign key to have CASCADE delete
-- This will allow user deletion to work properly

-- First, drop the existing foreign key constraint
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

-- Add the new foreign key constraint with CASCADE delete
ALTER TABLE user_settings 
ADD CONSTRAINT user_settings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;