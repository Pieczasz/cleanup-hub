ALTER TABLE "account" RENAME COLUMN "idToken" TO "refresh_token";--> statement-breakpoint
DROP INDEX IF EXISTS "accountUserIdIdx";--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "expires_at" integer;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "id_oken" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "refreshToken";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "accessToken";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "expiresAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "emailVerified";