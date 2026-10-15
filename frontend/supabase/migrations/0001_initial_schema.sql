-- ==============================================================================
-- Migration: 0001_initial_schema.sql
-- Description: Core schema for Mystery Learning Assignments with Row Level Security
-- ==============================================================================

-- 1. Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    course_name VARCHAR(120),
    description TEXT DEFAULT '',
    learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    due_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    published_at TIMESTAMPTZ
);

-- 2. Indexes for fast filtering and teacher queries
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON public.assignments(created_at DESC);

-- 3. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_assignments_updated_at ON public.assignments;
CREATE TRIGGER trigger_set_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies

-- Policy 1: Authenticated teachers can only select their own assignments
CREATE POLICY "Teachers can view own assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id);

-- Policy 2: Authenticated teachers can only insert assignments with their own teacher_id
CREATE POLICY "Teachers can create own assignments"
ON public.assignments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = teacher_id);

-- Policy 3: Authenticated teachers can only update DRAFTS they own.
-- Once published, the row cannot be edited through draft operations.
CREATE POLICY "Teachers can update own drafts"
ON public.assignments
FOR UPDATE
TO authenticated
USING (auth.uid() = teacher_id AND status = 'draft')
WITH CHECK (auth.uid() = teacher_id);

-- Policy 4: Authenticated teachers can only delete DRAFTS they own.
-- Published assignments cannot be deleted by draft operations.
CREATE POLICY "Teachers can delete own drafts"
ON public.assignments
FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id AND status = 'draft');
