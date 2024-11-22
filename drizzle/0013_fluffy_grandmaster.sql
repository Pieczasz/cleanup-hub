CREATE TABLE IF NOT EXISTS "cleanup_hub_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "cleanup_hub_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cleanup_hub_event" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"type" varchar(255) NOT NULL,
	"max_participants" integer,
	"participants" json DEFAULT '[]'::json,
	"userId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cleanup_hub_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cleanup_hub_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"password" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cleanup_hub_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "cleanup_hub_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DROP TABLE "account";--> statement-breakpoint
DROP TABLE "event";--> statement-breakpoint
DROP TABLE "session";--> statement-breakpoint
DROP TABLE "user";--> statement-breakpoint
DROP TABLE "verificationToken";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cleanup_hub_account" ADD CONSTRAINT "cleanup_hub_account_userId_cleanup_hub_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."cleanup_hub_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cleanup_hub_event" ADD CONSTRAINT "cleanup_hub_event_userId_cleanup_hub_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."cleanup_hub_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cleanup_hub_session" ADD CONSTRAINT "cleanup_hub_session_user_id_cleanup_hub_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cleanup_hub_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "cleanup_hub_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_user_id_idx" ON "cleanup_hub_event" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_date_idx" ON "cleanup_hub_event" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessionUserIdIdx" ON "cleanup_hub_session" USING btree ("user_id");