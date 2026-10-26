CREATE TABLE IF NOT EXISTS app_users (id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS projects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK(length(name) BETWEEN 1 AND 100), description text NOT NULL DEFAULT '', color text NOT NULL DEFAULT 'rust' CHECK(color IN ('rust','sage','blue','ochre')), due_date date, created_by text NOT NULL REFERENCES app_users(id), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS memberships (project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, user_id text NOT NULL REFERENCES app_users(id), role text NOT NULL CHECK(role IN ('lead','member')), PRIMARY KEY(project_id,user_id));
CREATE TABLE IF NOT EXISTS sprints (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, name text NOT NULL, start_date date NOT NULL, end_date date NOT NULL CHECK(end_date>=start_date));
CREATE TABLE IF NOT EXISTS tasks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, title text NOT NULL CHECK(length(title) BETWEEN 1 AND 200), description text NOT NULL DEFAULT '', assignee_id text, status text NOT NULL DEFAULT 'todo' CHECK(status IN ('backlog','todo','doing','review','done')), priority text NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high')), due_date date, sprint_id uuid REFERENCES sprints(id), created_at timestamptz NOT NULL DEFAULT now(), FOREIGN KEY(project_id,assignee_id) REFERENCES memberships(project_id,user_id));
CREATE TABLE IF NOT EXISTS notes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, author_id text NOT NULL REFERENCES app_users(id), body text NOT NULL CHECK(length(body) BETWEEN 1 AND 5000), kind text NOT NULL DEFAULT 'note' CHECK(kind IN ('note','shoutout')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS invitations (token uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, email text NOT NULL, role text NOT NULL CHECK(role IN ('lead','member')), expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days', UNIQUE(project_id,email));
CREATE TABLE IF NOT EXISTS messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_id text NOT NULL REFERENCES app_users(id), recipient_id text NOT NULL REFERENCES app_users(id), body text NOT NULL CHECK(length(body) BETWEEN 1 AND 5000), read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), CHECK(sender_id<>recipient_id));
CREATE INDEX IF NOT EXISTS memberships_user_idx ON memberships(user_id);
CREATE INDEX IF NOT EXISTS tasks_project_idx ON tasks(project_id,due_date);
CREATE INDEX IF NOT EXISTS notes_project_idx ON notes(project_id,created_at);
CREATE INDEX IF NOT EXISTS messages_participants_idx ON messages(recipient_id,sender_id,created_at);
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_data text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approval text NOT NULL DEFAULT 'approved' CHECK (approval IN ('pending','approved','declined'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submitted_by text REFERENCES app_users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS removed_at timestamptz;
CREATE TABLE IF NOT EXISTS note_comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE, author_id text NOT NULL REFERENCES app_users(id), body text NOT NULL CHECK(length(body) BETWEEN 1 AND 5000), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS note_reactions (note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE, user_id text NOT NULL REFERENCES app_users(id), reaction text NOT NULL CHECK(reaction IN ('appreciate','celebrate','agree')), active boolean NOT NULL DEFAULT true, PRIMARY KEY(note_id,user_id,reaction));
CREATE INDEX IF NOT EXISTS note_comments_note_idx ON note_comments(note_id,created_at);
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_reactions ENABLE ROW LEVEL SECURITY;

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
