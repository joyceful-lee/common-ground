ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id text REFERENCES app_users(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_template text;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT 'sage' CHECK(color IN ('sage','rust','blue','ochre','violet','teal'));
ALTER TABLE notes ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE OR REPLACE FUNCTION manage_project_member(project uuid, actor text, target text, operation text, next_role text DEFAULT 'member') RETURNS text LANGUAGE plpgsql AS $$
DECLARE current_owner text; actor_role text; target_role text;
BEGIN
 SELECT coalesce(owner_id,created_by) INTO current_owner FROM projects WHERE id=project FOR UPDATE;
 IF NOT FOUND THEN RETURN 'not-found'; END IF;
 SELECT role INTO actor_role FROM memberships WHERE project_id=project AND user_id=actor AND active;
 IF actor_role IS DISTINCT FROM 'lead' THEN RETURN 'forbidden'; END IF;
 SELECT role INTO target_role FROM memberships WHERE project_id=project AND user_id=target AND active;
 IF NOT FOUND THEN RETURN 'not-found'; END IF;
 IF operation='transfer' THEN
  IF actor<>current_owner THEN RETURN 'forbidden'; END IF;
  IF target=actor THEN RETURN 'same-owner'; END IF;
  UPDATE projects SET owner_id=target WHERE id=project;
  UPDATE memberships SET role=CASE WHEN user_id=target THEN 'lead' ELSE 'member' END WHERE project_id=project AND user_id IN(actor,target);
 ELSIF operation='remove' THEN
  IF target=current_owner THEN RETURN 'owner-protected'; END IF;
  UPDATE tasks SET assignee_id=NULL WHERE project_id=project AND assignee_id=target;
  UPDATE memberships SET active=false WHERE project_id=project AND user_id=target;
  UPDATE invitations SET expires_at=now() WHERE project_id=project AND lower(email)=(SELECT lower(email) FROM app_users WHERE id=target);
 ELSIF operation='role' THEN
  IF next_role NOT IN ('lead','member') THEN RETURN 'invalid-role'; END IF;
  IF target=current_owner AND next_role<>'lead' THEN RETURN 'owner-protected'; END IF;
  UPDATE memberships SET role=next_role WHERE project_id=project AND user_id=target;
 ELSE RETURN 'invalid-operation';
 END IF;
 RETURN 'ok';
END;
$$;
