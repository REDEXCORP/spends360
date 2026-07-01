-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION handle_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent recursive trigger execution
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    -- If this is an INSERT and is_default is FALSE, check if it's the user's ONLY workspace
    IF TG_OP = 'INSERT' AND NEW.is_default = FALSE THEN
        IF NOT EXISTS (
            SELECT 1 FROM workspace_members WHERE user_id = NEW.user_id
        ) THEN
            NEW.is_default = TRUE;
        END IF;
    END IF;

    -- If the new/updated row is set as default
    IF NEW.is_default = TRUE THEN
        -- Set all other workspaces for this user to not default
        UPDATE workspace_members
        SET is_default = FALSE
        WHERE user_id = NEW.user_id
          AND id <> NEW.id
          AND is_default = TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_handle_default_workspace ON workspace_members;
CREATE TRIGGER trg_handle_default_workspace
BEFORE INSERT OR UPDATE ON workspace_members
FOR EACH ROW
EXECUTE FUNCTION handle_default_workspace();