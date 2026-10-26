ALTER TABLE app_users ADD COLUMN IF NOT EXISTS avatar_data text;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Project update';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'none' CHECK(icon IN ('none','urgent','question','idea','milestone'));
UPDATE notes SET title=left(split_part(body,'.',1),120) WHERE title='Project update';
