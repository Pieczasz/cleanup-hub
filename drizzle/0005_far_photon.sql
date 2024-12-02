ALTER TABLE "donation" ADD COLUMN "platform_fee" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "donation" ADD COLUMN "stripe_session_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "donation" ADD COLUMN "status" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN IF EXISTS "payment_intent_id";--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN IF EXISTS "is_anonymous";--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_stripe_session_id_unique" UNIQUE("stripe_session_id");