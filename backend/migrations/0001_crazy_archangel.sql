CREATE TYPE "public"."request_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "requests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"workspace_id" bigint NOT NULL,
	"requester_id" bigint NOT NULL,
	"type" varchar(120),
	"title" varchar(255) NOT NULL,
	"description" text,
	"justification" text,
	"amount" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"department" varchar(120),
	"project" varchar(120),
	"cost_center" varchar(120),
	"vendor" varchar(150),
	"category" varchar(120),
	"priority" "request_priority" DEFAULT 'MEDIUM' NOT NULL,
	"status" "request_status" DEFAULT 'PENDING' NOT NULL,
	"due_date" timestamp with time zone,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_requests_workspace" ON "requests" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_requests_requester" ON "requests" USING btree ("workspace_id","requester_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_online";