ALTER TABLE "event" ALTER COLUMN "date" SET DEFAULT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_user_id_idx" ON "event" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_date_idx" ON "event" USING btree ("date");