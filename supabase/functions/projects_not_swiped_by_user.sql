-- RPC Function für bessere Performance beim Laden des Feeds
-- Diese Funktion gibt Projekte zurück, die ein User noch nicht geswiped hat

CREATE OR REPLACE FUNCTION projects_not_swiped_by_user(
  user_id UUID,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  teaser TEXT,
  categories TEXT[],
  status TEXT,
  created_at TIMESTAMPTZ,
  owner_id UUID,
  owner_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.teaser,
    p.categories,
    p.status,
    p.created_at,
    p.owner_id,
    pr.name as owner_name
  FROM projects p
  LEFT JOIN profiles pr ON p.owner_id = pr.id
  WHERE p.owner_id != user_id  -- Eigene Projekte ausschließen
    AND NOT EXISTS (
      SELECT 1 
      FROM swipes s 
      WHERE s.project_id = p.id 
        AND s.swiper_id = user_id
    )
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION projects_not_swiped_by_user TO authenticated;

-- Example usage:
-- SELECT * FROM projects_not_swiped_by_user('user-uuid-here', 10, 0);




