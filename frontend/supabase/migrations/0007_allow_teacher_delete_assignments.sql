-- ==============================================================================
-- Migration: 0007_allow_teacher_delete_assignments.sql
-- Description: Allow teachers to delete any assignment they own (draft or published)
-- ==============================================================================

DROP POLICY IF EXISTS "Teachers can delete own drafts" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can delete own assignments" ON public.assignments;

CREATE POLICY "Teachers can delete own assignments"
ON public.assignments
FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id);
