CREATE TABLE "telnyx_configs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"workspace_id" bigint NOT NULL,
	"config_encrypted" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" bigint,
	CONSTRAINT "telnyx_configs_workspaceId_unique" UNIQUE("workspace_id")
);
--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD CONSTRAINT "telnyx_configs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD CONSTRAINT "telnyx_configs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;