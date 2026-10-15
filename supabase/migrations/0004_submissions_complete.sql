-- ==============================================================================
-- Migration: 0004_submissions_complete.sql
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create public.submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(150),
    student_id_code VARCHAR(100),
    story_title TEXT,
    story_text TEXT,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    score INT DEFAULT 0,
    feedback TEXT,
    tab_switch_count INT DEFAULT 0,
    tab_switch_logs JSONB DEFAULT '[]'::jsonb,
    time_spent_seconds INT DEFAULT 0,
    photo_upload_url TEXT,
    ai_evaluations JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions(submitted_at DESC);

-- 2. Add question configuration & RAG columns to public.assignments
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS question_config JSONB DEFAULT '{"mcq": 2, "descriptive": 1, "puzzle": 1, "photo": false}'::jsonb,
ADD COLUMN IF NOT EXISTS rag_summary TEXT,
ADD COLUMN IF NOT EXISTS story_plans JSONB DEFAULT '[]'::jsonb;

-- 3. Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS policies for submissions
DROP POLICY IF EXISTS "Anyone with link can submit assignment" ON public.submissions;
CREATE POLICY "Anyone with link can submit assignment"
ON public.submissions
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON public.submissions;
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

DROP POLICY IF EXISTS "Public can view own submission" ON public.submissions;
CREATE POLICY "Public can view own submission"
ON public.submissions
FOR SELECT
TO public
USING (true);

-- 5. Ensure public can view assignments via link
DROP POLICY IF EXISTS "Anyone can view assignments by link" ON public.assignments;
CREATE POLICY "Anyone can view assignments by link"
ON public.assignments
FOR SELECT
TO public
USING (true);

-- 6. Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';
