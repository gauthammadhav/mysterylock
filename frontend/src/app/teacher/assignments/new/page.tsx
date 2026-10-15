"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
  AlertCircle,
  Lightbulb,
  Layers,
  HelpCircle,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { LearningObjectiveItem } from "@/types/curriculum";
import { ExtractedFact, FactType } from "@/types/facts";
import ObjectiveMatrixEditor from "@/components/curriculum/ObjectiveMatrixEditor";

export default function NewAssignmentPage() {
  const router = useRouter();

  // Basic Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [courseName, setCourseName] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");

  // Step 1: Document Upload & RAG Ingestion State
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStage, setParsingStage] = useState<string>("");
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [parsedMeta, setParsedMeta] = useState<{
    fileName: string;
    pageCount: number;
    totalChunks: number;
    previewExcerpt: string;
  } | null>(null);

  // Step 2: Objectives State
  const [objectives, setObjectives] = useState<LearningObjectiveItem[]>([]);

  // Step 3: Evidence-Grounded Facts (Candidate & Approved)
  const [isExtractingFacts, setIsExtractingFacts] = useState(false);
  const [facts, setFacts] = useState<ExtractedFact[]>([]);
  const [factsError, setFactsError] = useState<string | null>(null);

  // Submission / Generation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParsingError(null);
    }
  };

  // 1. Upload & Index Document via RAG Pipeline
  const handleParseDocument = async () => {
    if (!file) {
      setParsingError("Please select a document file (.pdf, .docx, or .txt).");
      return;
    }

    setIsParsing(true);
    setParsingError(null);
    setParsingStage("Extracting text and structure...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject", subject || "General Coursework");
      formData.append("title", title || file.name.replace(/\.[^/.]+$/, ""));

      setParsingStage("Chunking into semantic sections & generating 3072D embeddings...");

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process the document.");
      }

      setDocumentId(data.documentId);
      setParsedMeta({
        fileName: data.fileName,
        pageCount: data.pageCount,
        totalChunks: data.totalChunks,
        previewExcerpt: data.previewExcerpt,
      });

      setObjectives(data.learningObjectives || []);
      if (!title) {
        setTitle(`Investigation: ${data.fileName.replace(/\.[^/.]+$/, "")}`);
      }

      // Auto-extract candidate facts if objectives exist
      if (data.learningObjectives?.length > 0) {
        extractFactsForObjectives(
          data.documentId,
          data.learningObjectives.filter((o: any) => o.is_selected).map((o: any) => o.title),
          subject || "General Coursework"
        );
      }
    } catch (err: any) {
      setParsingError(err.message || "An error occurred while analyzing the document.");
    } finally {
      setIsParsing(false);
      setParsingStage("");
    }
  };

  // 2. Extract Evidence-Grounded Facts from Indexed Chunks
  const extractFactsForObjectives = async (
    docId: string | null,
    targetObjectives: string[],
    subj: string
  ) => {
    if (targetObjectives.length === 0) return;

    setIsExtractingFacts(true);
    setFactsError(null);

    try {
      // Create temporary assignment ID placeholder or use docId
      const res = await fetch("/api/facts/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: docId || "temp_assignment",
          documentId: docId,
          subject: subj,
          learningObjectives: targetObjectives,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract grounded facts.");
      }

      setFacts(data.facts || []);
    } catch (err: any) {
      setFactsError(err.message || "Failed to extract candidate facts.");
    } finally {
      setIsExtractingFacts(false);
    }
  };

  const toggleFactSelection = (factId: string) => {
    setFacts((prev) =>
      prev.map((f) => (f.id === factId ? { ...f, is_selected: !f.is_selected } : f))
    );
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const selectedObjectives = objectives
      .filter((o) => o.is_selected)
      .map((o) => o.title);

    if (selectedObjectives.length === 0) {
      setSubmitError("Please select or add at least one learning objective for the mystery.");
      return;
    }

    if (!title.trim() || !subject.trim()) {
      setSubmitError("Assignment Title and Subject are required.");
      return;
    }

    const approvedFacts = facts.filter((f) => f.is_selected);

    setIsSubmitting(true);

    try {
      // 1. Create assignment record
      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        course_name: courseName.trim() || undefined,
        description: description.trim() || undefined,
        learning_objectives: selectedObjectives,
        difficulty,
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
        status: "draft",
        approved_facts: approvedFacts,
      };

      const res = await fetch("/api/assignments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to create assignment.");
      }

      const assignmentId = resData.assignment?.id;

      // 2. Generate original descriptive mystery grounded in approved facts
      if (assignmentId) {
        await fetch("/api/mysteries/generate-descriptive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId }),
        });

        router.push(`/teacher/assignments/${assignmentId}/review`);
      } else {
        router.push("/teacher/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] text-[#202722] selection:bg-[#DCEBDD] selection:text-[#153D2E] pb-24">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E4E9E3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/teacher/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#68736B] hover:text-[#153D2E] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <span className="text-xs font-bold text-[#153D2E] px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#DCEBDD] flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#287A52]" />
            <span>RAG Assignment Studio</span>
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="mb-8 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#153D2E] break-words">
            Teacher Assignment Studio
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#68736B] leading-relaxed break-words">
            Upload your syllabus or lecture notes to extract verifiable learning objectives,
            curate evidence-backed facts, and generate a curriculum-grounded deduction mystery.
          </p>
        </div>

        <form onSubmit={handleCreateAssignment} className="space-y-8">
          {/* SECTION 1: COURSE MATERIAL INGESTION (RAG) */}
          <div className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#287A52] shrink-0" />
              <h2 className="text-lg font-bold text-[#153D2E] tracking-tight">
                1. Course Material Ingestion & Vector Indexing (RAG)
              </h2>
            </div>
            <p className="text-xs text-[#68736B] mb-6 leading-relaxed">
              Upload PDF, DOCX, or TXT. Documents are securely indexed with 3072-dimensional Gemini embeddings
              to ground all clues and questions in authentic coursework.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-[#CCD5CD] rounded-2xl p-6 text-center hover:border-[#287A52] transition-colors bg-[#FAFBF8]/50 flex flex-col items-center justify-center min-h-[190px]">
                <UploadCloud className="w-8 h-8 text-[#287A52] mb-3" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-[#153D2E] hover:underline">
                    Click to select file
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-[#68736B] mt-1">PDF, Word (DOCX), or Plain Text (Max 25MB)</p>
                {file && (
                  <div className="mt-3 w-full max-w-full text-xs font-semibold text-[#153D2E] bg-[#EBF4EE] px-3 py-2 rounded-xl border border-[#DCEBDD] flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#287A52] shrink-0" />
                    <span className="truncate flex-1 text-left" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[10px] text-[#68736B] shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 text-[#68736B] hover:text-[#DC2626] rounded-md transition-colors shrink-0"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Extraction Control */}
              <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] min-w-0">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-1">
                    RAG Parsing & Vector Grounding
                  </h4>
                  <p className="text-xs text-[#68736B] leading-relaxed break-words">
                    Splits material into section-aware semantic chunks, produces vector embeddings,
                    and extracts foundational learning objectives mapped to Bloom’s taxonomy.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E4E9E3] space-y-3">
                  {parsingError && (
                    <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2 break-words">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="min-w-0 flex-1">{parsingError}</span>
                    </div>
                  )}

                  {isParsing && parsingStage && (
                    <div className="flex items-center gap-2 text-[11px] text-[#287A52] font-medium bg-[#EBF4EE] px-3 py-1.5 rounded-lg border border-[#DCEBDD] animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                      <span className="truncate">{parsingStage}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleParseDocument}
                    disabled={!file || isParsing}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shrink-0"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#2EE6A8] shrink-0" />
                        <span>Indexing & Vectorizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#2EE6A8] shrink-0" />
                        <span>Index Material & Extract Objectives</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Ingestion Success Badge */}
            {parsedMeta && (
              <div className="mt-6 p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[#166534] block">
                      Document successfully indexed in RAG pipeline
                    </span>
                    <p className="text-[11px] text-[#15803D] truncate">
                      <span className="font-semibold">{parsedMeta.fileName}</span> • {parsedMeta.pageCount} page(s) •{" "}
                      {parsedMeta.totalChunks} semantic chunks with 3072D embeddings
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: LEARNING OBJECTIVE MATRIX */}
          <ObjectiveMatrixEditor objectives={objectives} onChange={setObjectives} />

          {/* SECTION 3: EVIDENCE-GROUNDED LEARNING POINTS PREVIEW */}
          <div className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#287A52] shrink-0" />
                  <h2 className="text-lg font-bold text-[#153D2E] tracking-tight">
                    3. Evidence-Grounded Learning Points (Candidate Facts)
                  </h2>
                </div>
                <p className="text-xs text-[#68736B] leading-relaxed">
                  Facts extracted directly from your source chunks. Select or edit the facts that will
                  be used to construct the mystery clues and rubric.
                </p>
              </div>

              {objectives.some((o) => o.is_selected) && (
                <button
                  type="button"
                  onClick={() =>
                    extractFactsForObjectives(
                      documentId,
                      objectives.filter((o) => o.is_selected).map((o) => o.title),
                      subject || "General Coursework"
                    )
                  }
                  disabled={isExtractingFacts}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#153D2E] bg-[#EBF4EE] hover:bg-[#DCEBDD] border border-[#DCEBDD] transition-colors shrink-0"
                >
                  {isExtractingFacts ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#287A52] shrink-0" />
                      <span>Retrieving & Grounding...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#287A52] shrink-0" />
                      <span>{facts.length > 0 ? "Re-Extract Facts" : "Extract Grounded Facts"}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {factsError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2 break-words">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="min-w-0 flex-1">{factsError}</span>
              </div>
            )}

            {facts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#FAFBF8] border border-dashed border-[#CCD5CD] text-center">
                <Lightbulb className="w-6 h-6 text-[#68736B] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#153D2E]">
                  No grounded facts extracted yet
                </p>
                <p className="text-[11px] text-[#68736B] mt-1 max-w-md mx-auto leading-relaxed">
                  Select your learning objectives above and click &quot;Extract Grounded Facts&quot; to inspect
                  the verifiable claims retrieved from your uploaded coursework.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#68736B] pb-1 gap-1">
                  <span>
                    Selected {facts.filter((f) => f.is_selected).length} of {facts.length} facts
                  </span>
                  <span className="text-[11px]">Click a card to toggle inclusion in the mystery</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {facts.map((fact) => (
                    <div
                      key={fact.id}
                      onClick={() => toggleFactSelection(fact.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer min-w-0 ${
                        fact.is_selected
                          ? "bg-[#FFFFFF] border-[#287A52] shadow-xs"
                          : "bg-[#FAFBF8] border-[#E4E9E3] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                              fact.is_selected
                                ? "bg-[#153D2E] border-[#153D2E] text-white"
                                : "border-[#CCD5CD] bg-white"
                            }`}
                          >
                            {fact.is_selected && <Check className="w-3.5 h-3.5" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#153D2E] leading-relaxed break-words">
                              {fact.statement}
                            </p>

                            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px]">
                              <span className="px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#153D2E] font-bold uppercase tracking-wider shrink-0">
                                {fact.fact_type}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-[#FAFBF8] text-[#68736B] border border-[#E4E9E3] shrink-0">
                                {fact.concept_category}
                              </span>
                              {fact.page_or_section && (
                                <span className="text-[#68736B] shrink-0">
                                  Source: {fact.page_or_section}
                                </span>
                              )}
                              <span className="text-[#287A52] font-semibold break-words">
                                Objective: {fact.learning_objective}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            fact.suggested_difficulty === "advanced"
                              ? "bg-[#FEF2F2] text-[#991B1B]"
                              : fact.suggested_difficulty === "intermediate"
                              ? "bg-[#FFFBEB] text-[#92400E]"
                              : "bg-[#F0FDF4] text-[#166534]"
                          }`}
                        >
                          {fact.suggested_difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: ASSIGNMENT METADATA & GENERATION */}
          <div className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#287A52] shrink-0" />
              <h2 className="text-lg font-bold text-[#153D2E] tracking-tight">4. Assignment Metadata & Studio Parameters</h2>
            </div>
            <p className="text-xs text-[#68736B] mb-6 leading-relaxed">
              Configure assignment title, subject discipline, target difficulty, and submission deadline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Investigation: Photosynthetic Rate Anomalies"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                  Subject Discipline *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Plant Biology, Organic Chemistry, Operating Systems"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                  Course / Section Name (Optional)
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. BIO-201 Section B"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                  Investigation Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
                >
                  <option value="easy">Introductory (Direct Observations & Definitions)</option>
                  <option value="medium">Intermediate (Mechanistic Links & Causal Deductions)</option>
                  <option value="hard">Advanced (Counterfactuals, Experimental Design & Synthesis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                  Due Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                  Teacher Notes / Context (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any specific context or focus areas you want the mystery to emphasize..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
                />
              </div>
            </div>

            {submitError && (
              <div className="mt-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2 break-words">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="min-w-0 flex-1">{submitError}</span>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#E4E9E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-[#68736B] leading-relaxed max-w-md">
                Next: Review the generated mystery, inspect descriptive questions & rubrics, and publish.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#2EE6A8] shrink-0" />
                    <span>Constructing Descriptive Mystery...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#2EE6A8] shrink-0" />
                    <span>Generate Mystery & Enter Studio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
