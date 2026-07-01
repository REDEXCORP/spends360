-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION delete_workspaces_before_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete workspaces where this user is a member AND there are no other members in that workspace
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

DROP TRIGGER IF EXISTS trg_delete_workspaces_before_user_delete ON users;
CREATE TRIGGER trg_delete_workspaces_before_user_delete
BEFORE DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION delete_workspaces_before_user_delete();