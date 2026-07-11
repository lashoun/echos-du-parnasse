-- get_random_poem_id(): return a random poem ID, optionally filtered.

CREATE OR REPLACE FUNCTION get_random_poem_id(
  p_author_id     UUID DEFAULT NULL,
  p_collection_id UUID DEFAULT NULL,
  p_tag_id        UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT p.id
  FROM poems p
  LEFT JOIN poem_tags pt ON pt.poem_id = p.id
  WHERE (p_author_id     IS NULL OR p.author_id     = p_author_id)
    AND (p_collection_id IS NULL OR p.collection_id = p_collection_id)
    AND (p_tag_id        IS NULL OR pt.tag_id       = p_tag_id)
  ORDER BY random()
  LIMIT 1
$$;
