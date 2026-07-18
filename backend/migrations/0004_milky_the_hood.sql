CREATE TYPE "public"."subscription_interval" AS ENUM('month', 'year');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'inactive', 'trialing', 'canceled', 'past_due', 'paused');--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "subscription_interval" "subscription_interval" DEFAULT 'month' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "user_count" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "paddle_subscription_id" varchar(255);