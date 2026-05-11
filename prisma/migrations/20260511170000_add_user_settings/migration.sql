-- Persist per-user settings without changing tenant isolation semantics.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "full_name" TEXT;

DO $$
BEGIN
  CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "SettingsLanguage" AS ENUM ('EN', 'TR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "user_settings" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "theme_preference" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
  "language" "SettingsLanguage" NOT NULL DEFAULT 'TR',
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  "email_notifications" BOOLEAN NOT NULL DEFAULT true,
  "in_app_notifications" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_settings_user_id_key" ON "user_settings"("user_id");
CREATE INDEX IF NOT EXISTS "user_settings_tenant_id_idx" ON "user_settings"("tenant_id");

DO $$
BEGIN
  ALTER TABLE "user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE "user_settings"
    ADD CONSTRAINT "user_settings_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
