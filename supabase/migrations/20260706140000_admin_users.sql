-- Admin users table for library administration.
-- Each row links a Supabase auth user to the admin role.

CREATE TABLE admin_users (
  user_id   UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can see only their own admin status.
-- Admins should be listed/managed via the service role client (admin/admins page).
CREATE POLICY "Read own: admin_users"
  ON admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only existing admins can promote new users.
CREATE POLICY "Insert: admin_users"
  ON admin_users
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Only existing admins can demote users (cannot remove themselves).
CREATE POLICY "Delete: admin_users"
  ON admin_users
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    AND auth.uid() != user_id
  );

-- ── Admin write policies for library tables ───────────────

CREATE POLICY "Admin insert: authors"
  ON authors FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin update: authors"
  ON authors FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin delete: authors"
  ON authors FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin insert: collections"
  ON collections FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin update: collections"
  ON collections FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin delete: collections"
  ON collections FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin insert: poems"
  ON poems FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin update: poems"
  ON poems FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin delete: poems"
  ON poems FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin insert: tags"
  ON tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin update: tags"
  ON tags FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin delete: tags"
  ON tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin insert: poem_tags"
  ON poem_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin delete: poem_tags"
  ON poem_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Note: The first admin must be inserted manually via Supabase Studio:
--   INSERT INTO admin_users (user_id) VALUES ('<auth-user-uuid>');
