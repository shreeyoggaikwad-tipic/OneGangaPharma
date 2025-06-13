-- Migration script for local PostgreSQL database
-- Ensures all required columns exist for the medicine upload system

-- Add image URL columns to medicines table if they don't exist
DO $$ 
BEGIN
    -- Add frontImageUrl column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' AND column_name = 'front_image_url'
    ) THEN
        ALTER TABLE medicines ADD COLUMN front_image_url VARCHAR(500);
        RAISE NOTICE 'Added front_image_url column to medicines table';
    ELSE
        RAISE NOTICE 'front_image_url column already exists';
    END IF;

    -- Add backImageUrl column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' AND column_name = 'back_image_url'
    ) THEN
        ALTER TABLE medicines ADD COLUMN back_image_url VARCHAR(500);
        RAISE NOTICE 'Added back_image_url column to medicines table';
    ELSE
        RAISE NOTICE 'back_image_url column already exists';
    END IF;

    -- Ensure other required columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE medicines ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to medicines table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE medicines ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to medicines table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE medicines ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to medicines table';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'medicines' 
ORDER BY ordinal_position;