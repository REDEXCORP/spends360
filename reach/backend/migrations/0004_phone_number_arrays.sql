ALTER TABLE "telnyx_configs" ADD COLUMN "sms_numbers_json" jsonb NOT NULL DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "telnyx_configs" ADD COLUMN "caller_ids_json" jsonb DEFAULT '[]'::jsonb;
