-- Allow Teachers to view ALL questions
DROP POLICY IF EXISTS "Students read questions for their class or below" ON questions;

CREATE POLICY "Users read active questions based on role"
  ON questions FOR SELECT
  USING (
    -- Any active question is visible to teachers/admins
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
    OR
    -- Students see questions for their class or below
    (
      is_active = true 
      AND class_standard <= (
        SELECT class_standard FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Ensure teachers can view their own questions regardless of active status
CREATE POLICY "Creators view own questions"
  ON questions FOR SELECT
  USING (
    created_by = auth.uid()
  );
