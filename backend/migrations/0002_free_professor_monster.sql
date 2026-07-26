CREATE TYPE "public"."approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "request_approvers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"request_id" bigint NOT NULL,
	"approver_id" bigint NOT NULL,
	"position" integer NOT NULL,
	"status" "approval_status" DEFAULT 'PENDING' NOT NULL,
	"acted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "assignee_id" bigint;--> statement-breakpoint
ALTER TABLE "request_approvers" ADD CONSTRAINT "request_approvers_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_approvers" ADD CONSTRAINT "request_approvers_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_request_approvers_request" ON "request_approvers" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_request_approvers_approver" ON "request_approvers" USING btree ("approver_id");--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;