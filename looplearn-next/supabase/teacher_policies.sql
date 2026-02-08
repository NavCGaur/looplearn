-- Allow teachers to view ANY questions they created (draft or active)
CREATE POLICY "Teachers view own questions"
  ON questions FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow teachers to view ALL profiles (to see students possibly later, or just general access)
-- Currently: "Users can view all profiles" exists, so that's covered.

-- Allow teachers to see statistics from User Progress (for analytics later)
CREATE POLICY "Teachers view all progress"
  ON user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );
