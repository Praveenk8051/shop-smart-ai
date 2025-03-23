-- Add isAdmin and authProvider fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authProvider" VARCHAR(255);

-- Update existing users to have authProvider='local'
UPDATE "User" SET "authProvider" = 'local' WHERE "authProvider" IS NULL;

-- Create admin user if it doesn't exist
INSERT INTO "User" ("id", "email", "name", "password", "isAdmin", "authProvider", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'admin@example.com',
  'Admin User',
  -- This is a bcrypt hash for 'admin123'
  '$2b$10$hNZCU3THRTucrvOZuJmGi.G9NsUJZ.QYY47s5VC4YwU0g0RxurWYS',
  true,
  'local',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "User" WHERE "email" = 'admin@example.com'
);