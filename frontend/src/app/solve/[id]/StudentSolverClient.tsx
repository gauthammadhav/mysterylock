"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  Lightbulb,
  Loader2,
  Lock,
  Puzzle,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Calendar,
  Layers,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { StudentSafeAssignmentPayload } from "@/lib/assignments/access";

function renderHighlightedText(text: string) {
  if (!text) return null;
  // Splits text by markdown bold **keyword**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const keyword = part.slice(2, -2);
      return (
        <mark
          key={index}
          className="bg-[#DCFCE7] text-[#14532D] font-bold px-1.5 py-0.5 rounded-md border border-[#86EFAC] shadow-2xs mx-0.5 inline-block"
        >
          {keyword}
        </mark>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

interface Props {
  assignment: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    course_name?: string | null;
    description?: string | null;
    learning_objectives: string[];
    status: string;
  };
}

export default function StudentSolverClient({ assignment }: Props) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Step 1: Identification & Verification State
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isLoadingCase, setIsLoadingCase] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 2: Case & Question State
  const [caseData, setCaseData] = useState<StudentSafeAssignmentPayload | null>(null);
  const [descriptiveAnswers, setDescriptiveAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "error" | "idle">("idle");
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Step 3: Tab Switch Anti-Cheat Telemetry
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabSwitchLogs, setTabSwitchLogs] = useState<string[]>([]);
  const [showIntegrityNotice, setShowIntegrityNotice] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Step 4: Final Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Anti-cheat tab switch listener
  useEffect(() => {
    if (!isStarted || submissionResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timeStr = new Date().toLocaleTimeString();
        setTabSwitchCount((prev) => prev + 1);
        setTabSwitchLogs((prev) => [...prev, `Tab unfocused at ${timeStr}`]);
        setShowIntegrityNotice(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isStarted, submissionResult]);

  // Exam timer
  useEffect(() => {
    if (!isStarted || submissionResult) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, submissionResult]);

  // Autosave debouncer
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleAnswerChange = (questionId: string, value: string) => {
    setDescriptiveAnswers((prev) => {
      const next = { ...prev, [questionId]: value };

      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
      setAutosaveStatus("saving");

      autosaveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch("/api/submissions/autosave", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assignmentId: assignment.id,
              accessToken: token,
              studentName: studentName.trim(),
              studentIdCode: studentId.trim(),
              descriptiveAnswers: next,
              tabSwitchCount,
              timeSpentSeconds: secondsElapsed,
            }),
          });
          setAutosaveStatus("saved");
        } catch {
          setAutosaveStatus("error");
        }
      }, 1500);

      return next;
    });
  };

  // Launch Investigation & Safe Load
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentId.trim()) {
      setErrorMsg("Please provide your full name and student ID to begin.");
      return;
    }

    setIsLoadingCase(true);
    setErrorMsg(null);

    try {
      const url = `/api/assignments/${assignment.id}/safe-load?studentId=${encodeURIComponent(
        studentId.trim()
      )}${token ? `&token=${encodeURIComponent(token)}` : ""}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load assignment case.");
      }

      setCaseData(data.assignment);
      if (data.savedDraft && Object.keys(data.savedDraft).length > 0) {
        setDescriptiveAnswers(data.savedDraft);
        setAutosaveStatus("saved");
      }

      setIsStarted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to launch assignment.");
    } finally {
      setIsLoadingCase(false);
    }
  };

  // Final Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData) return;

    const unanswered = caseData.questions.filter(
      (q) => !descriptiveAnswers[q.id] || descriptiveAnswers[q.id].trim().length < 15
    );

    if (unanswered.length > 0) {
      const firstUnanswered = unanswered[0];
      const targetIndex =
        caseData.story_acts && caseData.story_acts.length > 0
          ? caseData.story_acts.findIndex(
              (act) =>
                act.related_question_id === firstUnanswered.id ||
                act.act_number === firstUnanswered.question_number
            )
          : caseData.questions.findIndex((q) => q.id === firstUnanswered.id);

      if (targetIndex >= 0) {
        setActiveSectionIndex(targetIndex);
      }

      setErrorMsg(
        `Please provide a descriptive answer for Section #${firstUnanswered.question_number} before submitting.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/submissions/submit-descriptive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          accessToken: token,
          studentName: studentName.trim(),
          studentIdCode: studentId.trim(),
          descriptiveAnswers,
          tabSwitchCount,
          tabSwitchLogs,
          timeSpentSeconds: secondsElapsed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setSubmissionResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  // -------------------------------------------------------------
  // VIEW 1: STUDENT VERIFICATION SCREEN
  // -------------------------------------------------------------
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#FAFBF8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#153D2E] text-white flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#287A52]/40">
              <Compass className="w-6 h-6 text-[#2EE6A8]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#287A52] px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#DCEBDD]">
              {assignment.subject}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#153D2E] mt-3">
              {assignment.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#68736B]">
              Enter your student credentials to unlock your case briefing and investigation questions.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E4E9E3] p-8 shadow-xs">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleStart} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                  Full Student Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs sm:text-sm text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                  Student ID or Registration Code *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. S-2024-8841"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs sm:text-sm text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoadingCase}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] transition-all shadow-xs disabled:opacity-50"
                >
                  {isLoadingCase ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#2EE6A8]" />
                      <span>Verifying & Loading Mystery...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#2EE6A8]" />
                      <span>Begin Mystery Investigation</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[#E4E9E3] text-center">
              <p className="text-[11px] text-[#68736B]">
                Your responses autosave continuously. Tab-switch telemetry is recorded for academic integrity.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: CONFIRMATION SCREEN AFTER SUBMISSION
  // -------------------------------------------------------------
  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-[#E4E9E3] p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#EBF4EE] border border-[#BBF7D0] text-[#166534] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>

          <div>
            <span className="text-xs font-bold text-[#287A52] uppercase tracking-wider px-3 py-1 rounded-full bg-[#EBF4EE]">
              Investigation Submitted Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#153D2E] mt-3">
              Case Completed, {studentName}
            </h1>
            <p className="text-xs sm:text-sm text-[#68736B] mt-2">
              Your descriptive written responses and evidence citations have been logged.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 text-left">
            <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B]">
                Assigned Grade / Score
              </span>
              <p className="text-2xl font-bold text-[#153D2E] mt-1">{submissionResult.score}%</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B]">
                Total Investigation Time
              </span>
              <p className="text-2xl font-bold text-[#153D2E] mt-1">{formatTimer(secondsElapsed)}</p>
            </div>
          </div>

          {submissionResult.feedback && (
            <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] text-left space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                <span>Pedagogical Feedback</span>
              </div>
              <p className="leading-relaxed">{submissionResult.feedback}</p>
            </div>
          )}

          <div className="pt-4 border-t border-[#E4E9E3]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#153D2E] text-white text-xs font-bold hover:bg-[#1C523E] transition-colors"
            >
              <span>Return to Mystery Learning Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: ACTIVE MURDLE-STYLE MULTI-ACT READING & SOLVING PANE
  const storyActs = caseData?.story_acts || [];
  const totalSections = storyActs.length > 0 ? storyActs.length : (caseData?.questions?.length || 1);
  const safeSectionIndex = Math.min(Math.max(0, activeSectionIndex), Math.max(0, totalSections - 1));

  const currentAct = storyActs.length > 0 ? storyActs[safeSectionIndex] : null;
  const currentQuestion = storyActs.length > 0
    ? (caseData?.questions.find(
        (q) => q.id === currentAct?.related_question_id || q.question_number === currentAct?.act_number
      ) || caseData?.questions[safeSectionIndex])
    : caseData?.questions[safeSectionIndex];

  const qId = currentQuestion?.id || `q_${safeSectionIndex + 1}`;
  const currentAnswer = descriptiveAnswers[qId] || "";
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-[#FAFBF8] pb-24">
      {/* Sticky Top Status Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E4E9E3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#153D2E] text-[#2EE6A8] flex items-center justify-center font-bold text-xs">
              ML
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#153D2E] line-clamp-1">
                {caseData?.title || assignment.title}
              </h2>
              <span className="text-[10px] text-[#68736B]">
                Investigator: {studentName} ({studentId})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Autosave Status */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#68736B]">
              {autosaveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-[#287A52]" />
                  <span>Saving...</span>
                </>
              ) : autosaveStatus === "saved" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span className="text-[#166534]">Saved</span>
                </>
              ) : null}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs font-mono font-bold text-[#153D2E]">
              <Clock className="w-3.5 h-3.5 text-[#68736B]" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Focus Integrity Notice */}
      {showIntegrityNotice && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>
                Window unfocused detected ({tabSwitchCount} time(s)). Focus telemetry is logged for exam integrity.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowIntegrityNotice(false)}
              className="text-[#991B1B] hover:text-[#7F1D1D]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* STORY OVERVIEW BANNER */}
        <div className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#287A52] px-3 py-1 rounded-full bg-[#EBF4EE]">
              Topic: {caseData?.subject || assignment.subject}
            </span>
            <span className="text-xs text-[#68736B]">
              Student: <strong>{studentName}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#153D2E]">
            {caseData?.title || assignment.title}
          </h1>

          <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs sm:text-sm text-[#202722] leading-relaxed">
            {caseData?.narrative_premise || assignment.description}
          </div>
        </div>        {/* ONE QUESTION PER SECTION CONTAINER */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION NAVIGATION TABS */}
          <div className="bg-white rounded-2xl border border-[#E4E9E3] p-2 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {Array.from({ length: totalSections }).map((_, idx) => {
                const act = storyActs[idx];
                const q = storyActs.length > 0
                  ? (caseData?.questions.find(
                      (item) => item.id === act?.related_question_id || item.question_number === act?.act_number
                    ) || caseData?.questions[idx])
                  : caseData?.questions[idx];
                const thisQId = q?.id || `q_${idx + 1}`;
                const isAnswered = Boolean(descriptiveAnswers[thisQId] && descriptiveAnswers[thisQId].trim().length >= 15);
                const isActive = safeSectionIndex === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSectionIndex(idx)}
                    className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      isActive
                        ? "bg-[#153D2E] text-white border-[#153D2E] shadow-xs"
                        : "bg-[#FAFBF8] text-[#153D2E] border-[#E4E9E3] hover:bg-[#F3F6F3]"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? "bg-[#287A52] text-white"
                          : isAnswered
                          ? "bg-[#EBF4EE] text-[#166534]"
                          : "bg-white text-[#68736B] border border-[#E4E9E3]"
                      }`}
                    >
                      {isAnswered ? <Check className="w-3 h-3 text-[#166534]" /> : idx + 1}
                    </span>
                    <span className="truncate">Section {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE SECTION CONTENT - ONLY ONE QUESTION */}
          <div className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-10 shadow-xs space-y-8">
            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E9E3] pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#153D2E] text-white text-sm font-bold flex items-center justify-center shadow-xs">
                  {safeSectionIndex + 1}
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#153D2E]">
                    {currentAct?.title || currentQuestion?.title || `Section ${safeSectionIndex + 1}`}
                  </h2>
                  <span className="text-[11px] font-semibold text-[#68736B]">
                    Section {safeSectionIndex + 1} of {totalSections} • 1 Question in this Section
                  </span>
                </div>
              </div>

              {currentQuestion && (
                <span className="text-xs font-bold text-[#287A52] px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#BBF7D0]">
                  {currentQuestion.max_marks || 25} Marks
                </span>
              )}
            </div>

            {/* BIG PASSAGE WITH KEYWORDS HIGHLIGHTED IN GREEN */}
            {currentAct?.paragraphs && currentAct.paragraphs.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#153D2E]">
                  <BookOpen className="w-4 h-4 text-[#287A52]" />
                  <span>Case Reading Passage (Key Terms in Green)</span>
                </div>
                <div className="p-6 sm:p-8 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] space-y-5 text-base sm:text-lg text-[#202722] leading-relaxed">
                  {currentAct.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {renderHighlightedText(p)}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}

            {/* HELPFUL CLUE & HINT (DIRECTLY ABOVE THE QUESTION) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-[#92400E] font-bold">
                <Lightbulb className="w-4 h-4 text-[#D97706]" />
                <span>Helpful Clue & Hint</span>
              </div>
              <p className="text-[#78350F] leading-relaxed">
                {renderHighlightedText(
                  currentAct?.section_brief ||
                  currentAct?.unlocked_clue?.highlight_evidence ||
                  currentQuestion?.graduated_hints?.[0]?.hint_text ||
                  "Review the story passage above to find the key explanation."
                )}
              </p>
              {currentAct?.unlocked_clue?.analogy_explanation && (
                <div className="pt-2 border-t border-[#FDE68A]/70 text-[#92400E] text-xs leading-relaxed flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                  <span>
                    <strong>Everyday Example:</strong> {renderHighlightedText(currentAct.unlocked_clue.analogy_explanation)}
                  </span>
                </div>
              )}
            </div>

            {/* ONLY ONE QUESTION APPEARS HERE IN THIS SECTION */}
            {currentQuestion ? (
              <div className="pt-6 border-t border-[#E4E9E3] space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#153D2E] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#287A52]" />
                    <span>Question #{currentQuestion.question_number}</span>
                  </span>
                  <span className="text-xs font-bold text-[#287A52]">
                    Challenge {safeSectionIndex + 1} of {totalSections}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#153D2E]">
                  {currentQuestion.title}
                </h3>

                <div className="p-5 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] text-sm sm:text-base text-[#202722] leading-relaxed font-medium">
                  {currentQuestion.question_text}
                </div>

                {/* Written Response Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#68736B]">
                    <span className="font-semibold text-[#153D2E]">
                      Your Written Explanation & Justification:
                    </span>
                    <span>{wordCount} words</span>
                  </div>

                  <textarea
                    rows={6}
                    required
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                    placeholder="Write your descriptive answer here. Explain what happened, cite the clues above, and use the everyday analogy..."
                    className="w-full p-4 sm:p-5 rounded-2xl border border-[#E4E9E3] bg-[#FAFBF8] text-sm sm:text-base text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors leading-relaxed shadow-inner"
                  />
                </div>
              </div>
            ) : null}

            {/* SECTION PAGINATION & CONTROLS */}
            <div className="pt-6 border-t border-[#E4E9E3] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                disabled={safeSectionIndex === 0}
                onClick={() => {
                  setActiveSectionIndex((prev) => Math.max(0, prev - 1));
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold border border-[#E4E9E3] bg-[#FAFBF8] text-[#153D2E] hover:bg-[#F3F6F3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Section</span>
              </button>

              <div className="text-xs font-bold text-[#68736B]">
                Section {safeSectionIndex + 1} of {totalSections}
              </div>

              {safeSectionIndex < totalSections - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSectionIndex((prev) => Math.min(totalSections - 1, prev + 1));
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#153D2E] text-white hover:bg-[#1C523E] transition-colors shadow-xs"
                >
                  <span>Next Section</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#2EE6A8]" />
                      <span>Evaluating Written Answers...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#2EE6A8]" />
                      <span>Finalize & Submit Investigation</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Submit Access if all completed */}
          {safeSectionIndex < totalSections - 1 && (
            <div className="p-5 rounded-2xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#68736B]">
                You can move freely across sections using the tabs above. Once ready, you can submit your investigation.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-[#153D2E] bg-[#EBF4EE] hover:bg-[#DCEBDD] border border-[#BBF7D0] transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#287A52]" />
                <span>Submit All Answers</span>
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
