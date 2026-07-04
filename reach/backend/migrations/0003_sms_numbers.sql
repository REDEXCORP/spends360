ALTER TABLE "telnyx_configs" ADD COLUMN "sms_numbers" text;--> statement-breakpoint
UPDATE "telnyx_configs" SET "sms_numbers" = json_build_object('us', json_build_array("sms_from_number"))::text WHERE "sms_from_number" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "telnyx_configs" DROP COLUMN "sms_from_number";--> statement-breakpoint
ALTER TABLE "telnyx_configs" ALTER COLUMN "sms_numbers" SET NOT NULL;
