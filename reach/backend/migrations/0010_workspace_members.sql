CREATE TYPE "public"."plan" AS ENUM('FREE', 'PRO', 'ENTERPRISE');--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "name" varchar(255);--> statement-breakpoint
UPDATE "workspaces" SET "name" = 'Workspace ' || "id"::text WHERE "name" IS NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "slug" varchar(255);--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "plan" "plan" DEFAULT 'FREE';--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"workspace_id" bigint NOT NULL,
	"role" "role" NOT NULL,
	"is_default" boolean DEFAULT false,
	"invite_accepted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" bigint,
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" bigint
);
--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_workspace" ON "workspace_members" USING btree ("user_id","workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_default_workspace" ON "workspace_members" USING btree ("user_id") WHERE "is_default" = true;--> statement-breakpoint
INSERT INTO "workspace_members" ("user_id", "workspace_id", "role", "is_default", "invite_accepted", "created_by", "updated_by")
SELECT "id", "workspace_id", "role", true, true, "id", "id"
FROM "users"
WHERE "workspace_id" IS NOT NULL;
