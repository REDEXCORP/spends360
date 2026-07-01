-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION ensure_default_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user currently has NO default workspace
    IF NOT EXISTS (
        SELECT 1 FROM workspace_members
        WHERE user_id = OLD.user_id AND is_default = TRUE
    ) THEN
        -- If they have NO default workspace (because we deleted the default),
        -- AND they still have other workspaces, pick one to be the new default
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

DROP TRIGGER IF EXISTS trg_default_workspace_after_delete ON workspace_members;
CREATE TRIGGER trg_default_workspace_after_delete
AFTER DELETE ON workspace_members
FOR EACH ROW
EXECUTE FUNCTION ensure_default_after_delete();