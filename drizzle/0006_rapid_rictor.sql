CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DROP TABLE "verification_token";--> statement-breakpoint
DROP INDEX IF EXISTS "account_user_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "session_user_id_idx";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_provider_provider_account_id_pk";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "providerAccountId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refreshToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "accessToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "expiresAt" integer;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "tokenType" varchar(255);--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "idToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "sessionState" varchar(255);--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "sessionToken" varchar(255) PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accountUserIdIdx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessionUserIdIdx" ON "session" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "provider_account_id";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "refresh_token";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "access_token";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "token_type";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "id_token";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN IF EXISTS "session_state";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "session_token";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "email_verified";