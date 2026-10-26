ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order double precision NOT NULL DEFAULT (extract(epoch FROM clock_timestamp()) * 1000000);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'task' CHECK (kind IN ('task','event'));
ALTER TABLE notes ADD COLUMN IF NOT EXISTS removed_at timestamptz;
