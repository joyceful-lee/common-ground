ALTER TABLE memberships ADD COLUMN IF NOT EXISTS chat_muted boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS room_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 sender_id text NOT NULL REFERENCES app_users(id),
 body text NOT NULL CHECK(length(btrim(body)) BETWEEN 1 AND 2000),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS room_messages_project_idx ON room_messages(project_id,created_at,id);
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION room_chat_action(room uuid, actor text, operation text, target text DEFAULT NULL, message_body text DEFAULT NULL, mute_value boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE owner text; actor_role text; is_muted boolean; message_id uuid; outcome text;
BEGIN
 SELECT coalesce(owner_id,created_by) INTO owner FROM projects WHERE id=room FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('error','not-found'); END IF;
 SELECT role,chat_muted INTO actor_role,is_muted FROM memberships WHERE project_id=room AND user_id=actor AND active;
 IF NOT FOUND THEN RETURN jsonb_build_object('error','forbidden'); END IF;
 IF operation='send' THEN
  IF is_muted THEN RETURN jsonb_build_object('error','muted'); END IF;
  IF message_body IS NULL OR length(btrim(message_body)) NOT BETWEEN 1 AND 2000 THEN RETURN jsonb_build_object('error','invalid-message'); END IF;
  INSERT INTO room_messages(project_id,sender_id,body) VALUES(room,actor,btrim(message_body)) RETURNING id INTO message_id;
  RETURN jsonb_build_object('id',message_id);
 END IF;
 IF actor_role<>'lead' THEN RETURN jsonb_build_object('error','forbidden'); END IF;
 IF target=actor OR target=owner THEN RETURN jsonb_build_object('error','protected'); END IF;
 IF NOT EXISTS(SELECT 1 FROM memberships WHERE project_id=room AND user_id=target AND active) THEN RETURN jsonb_build_object('error','not-found'); END IF;
 IF operation='mute' THEN
  UPDATE memberships SET chat_muted=mute_value WHERE project_id=room AND user_id=target;
 ELSIF operation='kick' THEN
  SELECT manage_project_member(room,actor,target,'remove') INTO outcome;
  IF outcome<>'ok' THEN RETURN jsonb_build_object('error',outcome); END IF;
 ELSE RETURN jsonb_build_object('error','invalid-operation');
 END IF;
 RETURN jsonb_build_object('ok',true);
END;
$$;
