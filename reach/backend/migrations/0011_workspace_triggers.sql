CREATE OR REPLACE FUNCTION ensure_default_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM workspace_members
        WHERE user_id = OLD.user_id AND is_default = TRUE
    ) THEN
        UPDATE workspace_members
        SET is_default = TRUE
        WHERE id = (
            SELECT id FROM workspace_members
            WHERE user_id = OLD.user_id
            ORDER BY created_at DESC
            LIMIT 1
        );
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS trg_default_workspace_after_delete ON workspace_members;
--> statement-breakpoint
CREATE TRIGGER trg_default_workspace_after_delete
AFTER DELETE ON workspace_members
FOR EACH ROW
EXECUTE FUNCTION ensure_default_after_delete();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION handle_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' AND NEW.is_default = FALSE THEN
        IF NOT EXISTS (
            SELECT 1 FROM workspace_members WHERE user_id = NEW.user_id
        ) THEN
            NEW.is_default = TRUE;
        END IF;
    END IF;

    IF NEW.is_default = TRUE THEN
        UPDATE workspace_members
        SET is_default = FALSE
        WHERE user_id = NEW.user_id
          AND id <> NEW.id
          AND is_default = TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS trg_handle_default_workspace ON workspace_members;
--> statement-breakpoint
CREATE TRIGGER trg_handle_default_workspace
BEFORE INSERT OR UPDATE ON workspace_members
FOR EACH ROW
EXECUTE FUNCTION handle_default_workspace();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION delete_workspaces_before_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM workspaces w
    WHERE EXISTS (
        SELECT 1 FROM workspace_members wm
        WHERE wm.workspace_id = w.id
          AND wm.user_id = OLD.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM workspace_members wm2
        WHERE wm2.workspace_id = w.id
          AND wm2.user_id != OLD.id
    );

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS trg_delete_workspaces_before_user_delete ON users;
--> statement-breakpoint
CREATE TRIGGER trg_delete_workspaces_before_user_delete
BEFORE DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION delete_workspaces_before_user_delete();
