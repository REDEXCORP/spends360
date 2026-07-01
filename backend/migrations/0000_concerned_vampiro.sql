CREATE TYPE "public"."application_status" AS ENUM('APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'JOINED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');--> statement-breakpoint
CREATE TYPE "public"."pipeline_status" AS ENUM('DRAFT', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'CLOSED_WITH_NO_HIRE', 'CLOSED_WITH_HIRE', 'ON_HOLD');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'DEVELOPER', 'USER');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('REMOTE', 'ON_SITE', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('FREE', 'PRO', 'ENTERPRISE');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"job_id" bigint NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"zip" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"resume_url" text NOT NULL,
	"status" "application_status" DEFAULT 'APPLIED',
	"status_reason" varchar,
	"cover_letter" text,
	"match_score" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" bigint,
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"workspace_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"experience_min" integer,
	"experience_max" integer,
	"ctc_min" numeric,
	"ctc_max" numeric,
	"location" varchar(255),
	"type" "job_type" NOT NULL,
	"role" varchar(255) NOT NULL,
	"work_mode" "work_mode" NOT NULL,
	"description" text NOT NULL,
	"key_skills" varchar(1000),
	"pipeline_status" "pipeline_status" DEFAULT 'DRAFT',
	"openings" integer DEFAULT 1,
	"interviews" integer DEFAULT 0,
	"offered" integer DEFAULT 0,
	"hired" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" bigint,
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(50),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"refresh_token" varchar,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" bigint,
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" bigint,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"plan" "plan" DEFAULT 'FREE',
	"owner_id" bigint,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" bigint,
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" bigint
);
--> statement-breakpoint
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
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_workspace" ON "workspace_members" USING btree ("user_id","workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_default_workspace" ON "workspace_members" USING btree ("user_id") WHERE "workspace_members"."is_default" = true;