ALTER TABLE "account" RENAME COLUMN "sessionState" TO "token_type";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "session_state" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "tokenType";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "id_oken";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "email_verified";