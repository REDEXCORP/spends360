-- Workspace default integrity (column already added in 0002_military_outlaw_kid)

-- Leaving/removing default membership → repoint to oldest accepted, or NULL
CREATE OR REPLACE FUNCTION clear_or_repoint_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
	next_workspace_id bigint;
BEGIN
	IF EXISTS (
		SELECT 1
		FROM users
		WHERE id = OLD.user_id
		  AND default_workspace_id = OLD.workspace_id
	) THEN
		SELECT wm.workspace_id
		INTO next_workspace_id
		FROM workspace_members wm
		WHERE wm.user_id = OLD.user_id
		  AND wm.workspace_id <> OLD.workspace_id
		  AND wm.invite_accepted = TRUE
		ORDER BY wm.created_at ASC
		LIMIT 1;

		UPDATE users
		SET default_workspace_id = next_workspace_id,
			updated_at = now()
		WHERE id = OLD.user_id
		  AND default_workspace_id = OLD.workspace_id;
	END IF;

	RETURN OLD;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_repoint_default_workspace ON workspace_members;
--> statement-breakpoint

CREATE TRIGGER trg_repoint_default_workspace
BEFORE DELETE ON workspace_members
FOR EACH ROW
EXECUTE FUNCTION clear_or_repoint_default_workspace();
--> statement-breakpoint

-- Last member leaves → delete empty workspace (skip nested CASCADE from workspace delete)
CREATE OR REPLACE FUNCTION delete_empty_workspace_after_member_delete()
RETURNS TRIGGER AS $$
BEGIN
	IF pg_trigger_depth() > 1 THEN
		RETURN OLD;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM workspace_members WHERE workspace_id = OLD.workspace_id
	) THEN
		DELETE FROM workspaces WHERE id = OLD.workspace_id;
	END IF;

	RETURN OLD;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_delete_empty_workspace ON workspace_members;
--> statement-breakpoint

CREATE TRIGGER trg_delete_empty_workspace
AFTER DELETE ON workspace_members
FOR EACH ROW
EXECUTE FUNCTION delete_empty_workspace_after_member_delete();
--> statement-breakpoint

-- default_workspace_id must be NULL or an accepted membership for that user
CREATE OR REPLACE FUNCTION validate_user_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.default_workspace_id IS NULL THEN
		RETURN NEW;
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM workspace_members
		WHERE user_id = NEW.id
		  AND workspace_id = NEW.default_workspace_id
		  AND invite_accepted = TRUE
	) THEN
		RAISE EXCEPTION
			'default_workspace_id (%) must reference an accepted membership for user %',
			NEW.default_workspace_id,
			NEW.id;
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_validate_user_default_workspace ON users;
--> statement-breakpoint

CREATE TRIGGER trg_validate_user_default_workspace
BEFORE INSERT OR UPDATE OF default_workspace_id ON users
FOR EACH ROW
EXECUTE FUNCTION validate_user_default_workspace();
