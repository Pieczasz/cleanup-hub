CREATE TABLE IF NOT EXISTS "donation" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"donor_id" varchar(255),
	"amount" integer NOT NULL,
	"payment_intent_id" varchar(255) NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripeAccountId" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "donation" ADD CONSTRAINT "donation_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "donation" ADD CONSTRAINT "donation_donor_id_user_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
