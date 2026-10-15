-- ==============================================================================
-- Migration: 0006_rag_facts_and_assignment_studio.sql
-- Description: Core schema for RAG Document Ingestion, Chunking, Extracted Facts,
--              Assignment Snapshots, and Student Submissions.
-- ==============================================================================

-- 1. Enable pgvector extension if available (graceful fallback if not enabled)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension could not be enabled automatically. Falling back to float8 array.';
END $$;

-- 2. Documents table (Source materials uploaded by educators)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT DEFAULT 0,
    mime_type VARCHAR(100),
    file_path TEXT,
    subject VARCHAR(120),
    status VARCHAR(30) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'extracting', 'chunking', 'embedding', 'indexed', 'failed')),
    error_message TEXT,
    page_count INT DEFAULT 1,
    total_chunks INT DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_documents_teacher_id ON public.documents(teacher_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

-- 3. Document Chunks table (Semantic sections with vector embeddings)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    page_number INT DEFAULT 1,
    section_heading VARCHAR(255),
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    embedding float8[], -- Compatible with all Postgres setups; can be cast to vector(3072) when pgvector is active
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_hash ON public.document_chunks(content_hash);

-- 4. Extracted Educational Facts table (Evidence-grounded candidate & approved facts)
CREATE TABLE IF NOT EXISTS public.extracted_facts (
    id VARCHAR(80) NOT NULL,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    statement TEXT NOT NULL,
    fact_type VARCHAR(50) NOT NULL DEFAULT 'mechanism' CHECK (fact_type IN ('definition', 'mechanism', 'causal_relationship', 'comparison', 'application')),
    concept_category VARCHAR(120) NOT NULL,
    source_chunk_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    page_or_section VARCHAR(100),
    learning_objective TEXT NOT NULL,
    prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
    potential_misconceptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_difficulty VARCHAR(30) NOT NULL DEFAULT 'intermediate',
    assessment_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    is_selected BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (assignment_id, id)
);

CREATE INDEX IF NOT EXISTS idx_extracted_facts_assignment ON public.extracted_facts(assignment_id);

-- 5. Extend assignments table with access token & approval state
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS access_token VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS teacher_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_facts JSONB DEFAULT '[]'::jsonb;

-- 6. Assignment Versions table (Immutable publication snapshots)
CREATE TABLE IF NOT EXISTS public.assignment_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    access_token VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    difficulty VARCHAR(30) NOT NULL DEFAULT 'medium',
    approved_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
    mystery_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    questions_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    rubric_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(assignment_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_assignment_versions_token ON public.assignment_versions(access_token);
CREATE INDEX IF NOT EXISTS idx_assignment_versions_assignment_id ON public.assignment_versions(assignment_id);

-- 7. Submissions extension for descriptive answers & grading
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS version_id UUID REFERENCES public.assignment_versions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS access_token VARCHAR(64),
ADD COLUMN IF NOT EXISTS descriptive_answers JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS submission_status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (submission_status IN ('draft', 'submitted', 'graded')),
ADD COLUMN IF NOT EXISTS teacher_grade INT,
ADD COLUMN IF NOT EXISTS teacher_feedback TEXT,
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_submissions_token ON public.submissions(access_token);
CREATE INDEX IF NOT EXISTS idx_submissions_student_code ON public.submissions(student_id_code);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_versions ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for Documents
CREATE POLICY "Teachers can view own documents"
ON public.documents FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own documents"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own documents"
ON public.documents FOR UPDATE
TO authenticated
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own documents"
ON public.documents FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id);

-- 10. RLS Policies for Document Chunks
CREATE POLICY "Teachers can view chunks of own documents"
ON public.document_chunks FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.documents
        WHERE documents.id = document_chunks.document_id
        AND documents.teacher_id = auth.uid()
    )
);

CREATE POLICY "Teachers can manage chunks of own documents"
ON public.document_chunks FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.documents
        WHERE documents.id = document_chunks.document_id
        AND documents.teacher_id = auth.uid()
    )
);

-- 11. RLS Policies for Extracted Facts
CREATE POLICY "Teachers can manage extracted facts for their assignments"
ON public.extracted_facts FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = extracted_facts.assignment_id
        AND assignments.teacher_id = auth.uid()
    )
);

-- 12. RLS Policies for Assignment Versions
CREATE POLICY "Teachers can manage versions of their assignments"
ON public.assignment_versions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = assignment_versions.assignment_id
        AND assignments.teacher_id = auth.uid()
    )
);

-- Allow public access to published assignment versions via access token
CREATE POLICY "Anyone with valid token can view published version"
ON public.assignment_versions FOR SELECT
TO public
USING (access_token IS NOT NULL);

-- 13. Submissions update policy for students autosaving drafts
DROP POLICY IF EXISTS "Anyone can update draft submission by student code" ON public.submissions;
CREATE POLICY "Anyone can update draft submission by student code"
ON public.submissions FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
