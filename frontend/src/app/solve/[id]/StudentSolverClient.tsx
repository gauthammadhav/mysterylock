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
      setErrorMsg(
        `Please provide descriptive answers for all questions before submitting (Challenge #${unanswered[0].question_number} is incomplete).`
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
  // -------------------------------------------------------------
  const storyActs = caseData?.story_acts || [];

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
        {/* CASE PROLOGUE & PREMISE */}
        <div className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#287A52] px-2.5 py-1 rounded-full bg-[#EBF4EE]">
              {caseData?.case_number || "CASE-101"} • {caseData?.subject || assignment.subject}
            </span>
            <span className="text-xs text-[#68736B]">
              Role: <strong>{caseData?.investigative_role || "Lead Investigator"}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#153D2E]">
            {caseData?.title || assignment.title}
          </h1>

          <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs sm:text-sm text-[#202722] leading-relaxed">
            {caseData?.narrative_premise || assignment.description}
          </div>

          {caseData?.setting_context && (
            <p className="text-xs text-[#68736B]">
              <strong>Setting & Environment:</strong> {caseData.setting_context}
            </p>
          )}
        </div>

        {/* PROGRESSIVE MURDLE ACTS & EMBEDDED BRIEFS */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {storyActs.length > 0 ? (
            storyActs.map((act) => {
              // Find the question matching this act
              const pairedQuestion = caseData?.questions.find(
                (q) => q.id === act.related_question_id || q.question_number === act.act_number
              );
              const qId = pairedQuestion?.id || `q_${act.act_number}`;
              const currentAnswer = descriptiveAnswers[qId] || "";
              const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

              return (
                <div
                  key={act.act_number}
                  className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-6"
                >
                  {/* Act Header */}
                  <div className="flex items-center justify-between border-b border-[#E4E9E3] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#153D2E] text-white text-xs font-bold flex items-center justify-center">
                        {act.act_number}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-[#153D2E]">
                        {act.title}
                      </h2>
                    </div>

                    <span className="text-[11px] font-semibold text-[#68736B] uppercase tracking-wider">
                      Narrative Section {act.act_number}
                    </span>
                  </div>

                  {/* Substantive Story Paragraphs */}
                  <div className="space-y-4 text-xs sm:text-sm text-[#202722] leading-relaxed">
                    {act.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="indent-2 sm:indent-4">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* MURDLE DEDUCTION BRIEF & HINT */}
                  <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs space-y-1">
                    <div className="flex items-center gap-2 text-[#92400E] font-bold">
                      <Lightbulb className="w-4 h-4 text-[#D97706]" />
                      <span>Quick Clue & Key Takeaway</span>
                    </div>
                    <p className="text-[#78350F] leading-relaxed">
                      {act.section_brief}
                    </p>
                  </div>

                  {/* UNLOCKED CLUE CARD WITH SIMPLE ANALOGY */}
                  {act.unlocked_clue && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFBF8] border border-[#287A52]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF4EE] text-[#153D2E]">
                          Unlocked Clue: {act.unlocked_clue.name}
                        </span>
                        {act.unlocked_clue.is_anomaly && (
                          <span className="text-[10px] font-bold text-[#DC2626] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Surprise Clue</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-[#153D2E]">
                        {act.unlocked_clue.highlight_evidence}
                      </p>

                      {/* Intuitive Everyday Analogy */}
                      {act.unlocked_clue.analogy_explanation && (
                        <div className="p-3 rounded-xl bg-white border border-[#E4E9E3] text-xs text-[#68736B] flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-[#287A52] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-[#153D2E]">Everyday Analogy:</strong>{" "}
                            {act.unlocked_clue.analogy_explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PAIRED DESCRIPTIVE INQUIRY */}
                  {pairedQuestion && (
                    <div className="mt-6 pt-6 border-t border-[#E4E9E3] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#153D2E] flex items-center gap-2">
                          <Scale className="w-4 h-4 text-[#287A52]" />
                          <span>Question #{pairedQuestion.question_number}</span>
                        </span>
                        <span className="text-xs font-bold text-[#287A52] px-2.5 py-0.5 rounded-full bg-[#EBF4EE]">
                          {pairedQuestion.max_marks || 25} Marks
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#153D2E]">
                        {pairedQuestion.title}
                      </h3>

                      <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs sm:text-sm text-[#202722] leading-relaxed">
                        {pairedQuestion.question_text}
                      </div>

                      {/* Graduated Hint Toggle */}
                      {pairedQuestion.graduated_hints && pairedQuestion.graduated_hints.length > 0 && (
                        <div>
                          {!revealedHints[qId] ? (
                            <button
                              type="button"
                              onClick={() => setRevealedHints((prev) => ({ ...prev, [qId]: true }))}
                              className="inline-flex items-center gap-1.5 text-xs text-[#287A52] hover:text-[#153D2E] font-semibold"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Need guidance? Click to reveal hints</span>
                            </button>
                          ) : (
                            <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs space-y-1">
                              <span className="font-bold text-[#92400E] block">Hint Ladder:</span>
                              {pairedQuestion.graduated_hints.map((h, hIdx) => (
                                <p key={hIdx} className="text-[#78350F]">
                                  <strong>Tier {h.tier}:</strong> {h.hint_text}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Written Response Textarea */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-[#68736B]">
                          <span>Your Written Analysis & Justification:</span>
                          <span>{wordCount} words</span>
                        </div>

                        <textarea
                          rows={5}
                          required
                          value={currentAnswer}
                          onChange={(e) => handleAnswerChange(qId, e.target.value)}
                          placeholder="Explain the mechanism and cite specific observations and analogies from this Act..."
                          className="w-full p-4 rounded-2xl border border-[#E4E9E3] bg-[#FAFBF8] text-xs sm:text-sm text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-colors leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Fallback for legacy assignments without story_acts
            caseData?.questions?.map((q, idx) => {
              const currentAnswer = descriptiveAnswers[q.id] || "";
              const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
              return (
                <div
                  key={q.id || idx}
                  className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#153D2E]">Challenge #{q.question_number}</span>
                    <span className="text-xs font-bold text-[#287A52]">{q.max_marks || 25} Marks</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#153D2E]">{q.title}</h3>
                  <p className="text-xs text-[#202722] p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                    {q.question_text}
                  </p>
                  <textarea
                    rows={5}
                    required
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Write your explanation here..."
                    className="w-full p-4 rounded-xl border border-[#E4E9E3] text-xs"
                  />
                </div>
              );
            })
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Finalize Action */}
          <div className="p-6 rounded-3xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#68736B]">
              Review your written explanations before submitting. Once finalized, your responses are evaluated against the rubric.
            </p>

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
          </div>
        </form>
      </main>
    </div>
  );
}
