ALTER TABLE "event" DROP CONSTRAINT "event_userId_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "event_user_id_idx";--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "location" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "participant_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "creator_id" varchar(255) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event" ADD CONSTRAINT "event_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_creator_id_idx" ON "event" USING btree ("creator_id");--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN IF EXISTS "participants";--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN IF EXISTS "userId";