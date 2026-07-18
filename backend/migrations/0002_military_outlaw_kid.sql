DROP INDEX "uq_user_default_workspace";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "default_workspace_id" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_default_workspace_id_workspaces_id_fk" FOREIGN KEY ("default_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" DROP COLUMN "is_default";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "plan";--> statement-breakpoint
DROP TYPE "public"."plan";