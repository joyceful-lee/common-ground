ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_data text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approval text NOT NULL DEFAULT 'approved' CHECK (approval IN ('pending','approved','declined'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submitted_by text REFERENCES app_users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS removed_at timestamptz;
CREATE TABLE IF NOT EXISTS note_comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE, author_id text NOT NULL REFERENCES app_users(id), body text NOT NULL CHECK(length(body) BETWEEN 1 AND 5000), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS note_reactions (note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE, user_id text NOT NULL REFERENCES app_users(id), reaction text NOT NULL CHECK(reaction IN ('appreciate','celebrate','agree')), active boolean NOT NULL DEFAULT true, PRIMARY KEY(note_id,user_id,reaction));
CREATE INDEX IF NOT EXISTS note_comments_note_idx ON note_comments(note_id,created_at);
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_reactions ENABLE ROW LEVEL SECURITY;
