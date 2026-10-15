# MysteryLock (MysteryLearn)

> **Transforming coursework into individual, story-driven mystery investigations.**

MysteryLock (MysteryLearn) is an authentic assessment platform that turns syllabus-aligned curriculum materials into personalized, deductive mystery assignments for students. Rather than vulnerable standard multiple-choice or easily plagiarized prompts, assignments require staged, grounded reasoning and clue synthesis.

---

## 📁 Repository Structure

```
.
├── docs/                   # Architecture, PRD, and technical implementation references
├── frontend/               # Next.js 15 (App Router), React, Tailwind CSS, TypeScript
│   ├── src/
│   │   ├── app/            # App routes (Teacher dashboard, Student solver, API endpoints)
│   │   ├── components/     # UI design system and landing page components
│   │   ├── lib/            # AI pipelines (Gemini), RAG extraction, Supabase clients
│   │   └── types/          # Core TypeScript schema and domain models
│   └── supabase/           # Local migrations & DB scripts
└── supabase/               # Master Supabase schemas and database migrations
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- npm / pnpm / yarn
- Supabase project (or local Supabase CLI instance)
- Google Gemini API Key

### 2. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` inside `frontend`:
```bash
cp .env.example .env.local
```

Configure your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

### 4. Running the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Styling**: Tailwind CSS
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, pgvector)
- **AI / LLM**: Google Gemini API for curriculum extraction, blueprint generation, and story variation
