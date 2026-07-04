ALTER TABLE "telnyx_configs" ADD COLUMN "api_key_encrypted" text;--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD COLUMN "connection_id" text;--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD COLUMN "password_encrypted" text;--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD COLUMN "public_key_encrypted" text;--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD COLUMN "sms_from_number" text;--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD COLUMN "caller_ids" text;
