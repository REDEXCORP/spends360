ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_workspace_id_workspaces_id_fk";
ALTER TABLE "users" DROP COLUMN IF EXISTS "workspace_id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
