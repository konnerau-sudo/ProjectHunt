-- Supabase Functions für Like/Icebreaker & Chats
-- Führe diese SQL-Befehle in deiner Supabase SQL Editor aus

-- 1. Funktion: Match erstellen und erste Nachricht senden
CREATE OR REPLACE FUNCTION ensure_match_and_send_message(
  p_other_user UUID,
  p_text TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user UUID;
  v_match_id UUID;
  v_user_a UUID;
  v_user_b UUID;
BEGIN
  -- Aktuellen User aus auth.uid() holen
  v_current_user := auth.uid();
  
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  IF v_current_user = p_other_user THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;
  
  -- Canonical order für User-Paare (kleinere ID zuerst)
  IF v_current_user < p_other_user THEN
    v_user_a := v_current_user;
    v_user_b := p_other_user;
  ELSE
    v_user_a := p_other_user;
    v_user_b := v_current_user;
  END IF;
  
  -- Match finden oder erstellen (idempotent)
  SELECT id INTO v_match_id
  FROM matches
  WHERE user_a_id = v_user_a AND user_b_id = v_user_b
  LIMIT 1;
  
  IF v_match_id IS NULL THEN
    -- Neuen Match erstellen
    INSERT INTO matches (user_a_id, user_b_id, project_id)
    VALUES (v_user_a, v_user_b, NULL) -- project_id kann später gesetzt werden
    RETURNING id INTO v_match_id;
  END IF;
  
  -- Erste Nachricht (Icebreaker) senden
  INSERT INTO messages (match_id, sender_id, content)
  VALUES (v_match_id, v_current_user, p_text);
  
  RETURN v_match_id;
END;
$$;

-- 2. Funktion: Matches für aktuellen User abrufen
CREATE OR REPLACE FUNCTION get_matches_for_current_user(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  match_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  last_message_content TEXT,
  last_message_timestamp TIMESTAMPTZ,
  unread_count INTEGER,
  project_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user UUID;
BEGIN
  v_current_user := auth.uid();
  
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  RETURN QUERY
  SELECT 
    m.id as match_id,
    CASE 
      WHEN m.user_a_id = v_current_user THEN m.user_b_id
      ELSE m.user_a_id
    END as other_user_id,
    p.name as other_user_name,
    last_msg.content as last_message_content,
    last_msg.created_at as last_message_timestamp,
    COALESCE(unread.count, 0) as unread_count,
    proj.title as project_title
  FROM matches m
  LEFT JOIN profiles p ON (
    CASE 
      WHEN m.user_a_id = v_current_user THEN m.user_b_id
      ELSE m.user_a_id
    END = p.id
  )
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM messages
    WHERE match_id = m.id
    ORDER BY created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages
    WHERE match_id = m.id
      AND sender_id != v_current_user
      AND created_at > COALESCE(
        (SELECT MAX(created_at) FROM messages 
         WHERE match_id = m.id AND sender_id = v_current_user), 
        '1970-01-01'::timestamptz
      )
  ) unread ON true
  LEFT JOIN projects proj ON m.project_id = proj.id
  WHERE m.user_a_id = v_current_user OR m.user_b_id = v_current_user
  ORDER BY last_msg.created_at DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 3. RLS Policies für die neuen Funktionen
GRANT EXECUTE ON FUNCTION ensure_match_and_send_message(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_matches_for_current_user(INTEGER, INTEGER) TO authenticated;

-- 4. Zusätzliche Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user_a_id, user_b_id);
CREATE INDEX IF NOT EXISTS idx_messages_match_created ON messages(match_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_swipes_user_direction ON swipes(swiper_id, direction);
