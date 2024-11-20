CREATE TABLE IF NOT EXISTS "event" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"type" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event" ADD CONSTRAINT "event_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_user_id_idx" ON "event" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_date_idx" ON "event" USING btree ("date");