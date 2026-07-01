ALTER TABLE "users" ADD COLUMN "otp" varchar(6);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "slug";