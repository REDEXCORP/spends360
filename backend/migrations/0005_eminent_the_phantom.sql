DROP TABLE "applications" CASCADE;--> statement-breakpoint
DROP TABLE "jobs" CASCADE;--> statement-breakpoint
ALTER TABLE "workspace_members" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
ALTER TABLE "workspace_members" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "plan" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "plan" SET DEFAULT 'FREE'::text;--> statement-breakpoint
DROP TYPE "public"."plan";--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('FREE', 'PRO');--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "plan" SET DEFAULT 'FREE'::"public"."plan";--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "plan" SET DATA TYPE "public"."plan" USING "plan"::"public"."plan";--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
DROP TYPE "public"."job_type";--> statement-breakpoint
DROP TYPE "public"."pipeline_status";--> statement-breakpoint
DROP TYPE "public"."work_mode";