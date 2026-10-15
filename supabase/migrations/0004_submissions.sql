-- ==============================================================================
-- Migration: 0004_submissions.sql
-- Description: Student submissions and answer logs for shareable assignment URLs
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(150),
    story_title TEXT,
    story_text TEXT,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    score INT DEFAULT 0,
    feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Any student with the assignment link can insert a submission
CREATE POLICY "Anyone with link can submit assignment"
ON public.submissions
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Teachers can view all submissions for their own assignments
CREATE POLICY "Teachers can view submissions for their assignments"
ON public.submissions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = submissions.assignment_id
        AND assignments.teacher_id = auth.uid()
    )
);

-- Policy 3: Public can view submission confirmation by ID
CREATE POLICY "Public can view own submission"
ON public.submissions
FOR SELECT
TO public
USING (true);
