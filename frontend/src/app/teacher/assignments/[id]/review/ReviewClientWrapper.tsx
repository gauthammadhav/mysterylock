"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FileCheck2,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Puzzle,
  Scale,
  Send,
  Sparkles,
  Users,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Camera,
  Copy,
  ExternalLink,
  GraduationCap,
  Calendar,
  Check,
  Search,
  Eye,
  ShieldCheck,
  Info,
  Trash2,
  X,
} from "lucide-react";
import { DescriptiveMysteryAssignment, DescriptiveQuestion } from "@/types/descriptive";
import { ExtractedFact } from "@/types/facts";

interface Props {
  assignment: any;
  mystery: any;
  checkpoints: any[];
  variants: any[];
  submissions: any[];
}

export default function ReviewClientWrapper({
  assignment,
  mystery: initialMystery,
  checkpoints: initialCheckpoints,
  variants: initialVariants,
  submissions: initialSubmissions,
}: Props) {
  const router = useRouter();

  // Tabs: blueprint | questions | facts | submissions
  const [activeTab, setActiveTab] = useState<"blueprint" | "questions" | "facts" | "submissions">("blueprint");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>("q_1");
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  // Assignment & Mystery State
  const mysteryData: DescriptiveMysteryAssignment | null =
    (assignment.story_plans && assignment.story_plans[0]) || initialMystery || null;
  const approvedFacts: ExtractedFact[] = assignment.approved_facts || [];

  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(assignment.status === "published");
  const [accessToken, setAccessToken] = useState<string>(assignment.access_token || "");

  // Delete Assignment State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Construct absolute URL for student solving with unguessable token
  const studentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/solve/${assignment.id}${accessToken ? `?token=${accessToken}` : ""}`
      : `/solve/${assignment.id}${accessToken ? `?token=${accessToken}` : ""}`;

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(studentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDeleteAssignment = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete assignment.");
      }
      router.push("/teacher/dashboard");
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete assignment.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}/publish-version`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mysteryData: mysteryData || {
            title: assignment.title,
            narrative_premise: assignment.description || "Investigative case study.",
            academic_discipline: assignment.subject,
            total_marks: 100,
          },
          approvedFacts,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPublishSuccess(true);
        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
        router.refresh();
      } else {
        alert(data.error || "Failed to publish assignment snapshot.");
      }
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: Assignment Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#287A52] uppercase tracking-wider mb-1.5 flex-wrap">
            <Compass className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[260px]" title={assignment.subject}>{assignment.subject}</span>
            <span>•</span>
            <span>Teacher Assignment Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#153D2E] break-words">
            {assignment.title}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#68736B] flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{approvedFacts.length} Grounded Learning Facts</span>
            <span>•</span>
            <span>{mysteryData?.questions?.length || 4} Descriptive Questions</span>
            <span>•</span>
            <span>{submissions.length} Student Submissions</span>
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          {/* Delete Assignment Button */}
          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteError(null);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] transition-all shadow-xs shrink-0"
            title="Delete this assignment"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Delete Assignment</span>
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
              publishSuccess
                ? "bg-[#EBF4EE] text-[#166534] border border-[#BBF7D0] hover:bg-[#DCEBDD]"
                : "bg-[#153D2E] text-white hover:bg-[#1C523E]"
            }`}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#2EE6A8] shrink-0" />
                <span>Publishing Snapshot...</span>
              </>
            ) : publishSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Published (Update Snapshot)</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#2EE6A8] shrink-0" />
                <span>Approve & Publish Assignment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SHAREABLE STUDENT LINK BANNER */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#153D2E] to-[#1C523E] text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 min-w-0">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2EE6A8]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Unguessable Student Access Link</span>
          </span>
          <h3 className="text-base sm:text-lg font-bold break-words">
            Share this link with your students to take the investigation
          </h3>
          <p className="text-xs text-[#DCEBDD] leading-relaxed break-words">
            Students access the published mystery, review evidence clues, and submit open-ended descriptive explanations.
          </p>
          <div className="mt-2.5 flex items-center gap-2 bg-black/20 border border-white/20 rounded-xl p-1.5 pr-2.5 max-w-xl min-w-0">
            <span className="text-[11px] text-white/80 font-mono truncate px-2 select-all flex-1 min-w-0">
              {studentUrl}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 lg:pt-0">
          <button
            type="button"
            onClick={copyToClipboard}
            className="w-full sm:w-auto flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#153D2E] text-xs font-bold hover:bg-[#FAFBF8] transition-all shadow-xs shrink-0"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#153D2E] shrink-0" />
                <span>Copy Student Link</span>
              </>
            )}
          </button>

          <Link
            href={studentUrl}
            target="_blank"
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 flex items-center justify-center"
            title="Preview student solver in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* STUDIO TABS NAVIGATION */}
      <div className="flex border-b border-[#E4E9E3] gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          type="button"
          onClick={() => setActiveTab("blueprint")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === "blueprint"
              ? "border-[#153D2E] text-[#153D2E]"
              : "border-transparent text-[#68736B] hover:text-[#153D2E]"
          }`}
        >
          <Puzzle className="w-4 h-4" />
          <span>Case Briefing & Clues</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === "questions"
              ? "border-[#153D2E] text-[#153D2E]"
              : "border-transparent text-[#68736B] hover:text-[#153D2E]"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Descriptive Questions & Rubrics ({mysteryData?.questions?.length || 4})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("facts")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === "facts"
              ? "border-[#153D2E] text-[#153D2E]"
              : "border-transparent text-[#68736B] hover:text-[#153D2E]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Grounded Facts ({approvedFacts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === "submissions"
              ? "border-[#153D2E] text-[#153D2E]"
              : "border-transparent text-[#68736B] hover:text-[#153D2E]"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Submissions & Grading ({submissions.length})</span>
        </button>
      </div>

      {/* TAB 1: CASE BRIEFING & CLUES */}
      {activeTab === "blueprint" && (
        <div className="space-y-6">
          {/* Narrative Premise */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E9E3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#287A52] px-2.5 py-1 rounded-full bg-[#EBF4EE]">
                {mysteryData?.case_number || "CASE-101"} • {mysteryData?.academic_discipline || assignment.subject}
              </span>
              <span className="text-xs text-[#68736B]">
                Investigative Role: <strong>{mysteryData?.investigative_role || "Lead Investigator"}</strong>
              </span>
            </div>

            <h2 className="text-xl font-bold text-[#153D2E]">
              {mysteryData?.title || assignment.title}
            </h2>

            <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs sm:text-sm text-[#202722] leading-relaxed">
              {mysteryData?.narrative_premise || assignment.description || "Investigative inquiry into course mechanics."}
            </div>

            {mysteryData?.setting_context && (
              <p className="text-xs text-[#68736B]">
                <strong>Setting & Facility:</strong> {mysteryData.setting_context}
              </p>
            )}
          </div>

          {/* Murdle Progressive Narrative Acts (4 Acts) */}
          {mysteryData?.story_acts && mysteryData.story_acts.length > 0 ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#EBF4EE] border border-[#BBF7D0] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#287A52]" />
                  <span className="text-xs font-bold text-[#166534]">
                    Murdle Progressive Deduction Flow: 4 Sequential Story Acts & Paired Evidence
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#287A52] uppercase tracking-wider">
                  Descriptive Murdle Architecture
                </span>
              </div>

              {mysteryData.story_acts.map((act) => {
                const pairedQuestion = mysteryData.questions?.find(
                  (q) => q.id === act.related_question_id || q.question_number === act.act_number
                );

                return (
                  <div
                    key={act.act_number}
                    className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E9E3] shadow-xs space-y-5 min-w-0"
                  >
                    {/* Act Header */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-[#E4E9E3] pb-3 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-7 h-7 rounded-xl bg-[#153D2E] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {act.act_number}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-[#153D2E] break-words">
                          {act.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-[#68736B] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAFBF8] border border-[#E4E9E3] shrink-0">
                        Act {act.act_number} of {mysteryData.story_acts?.length || 4}
                      </span>
                    </div>

                    {/* Substantive Multi-Paragraph Reading Passage */}
                    <div className="space-y-3 text-xs sm:text-sm text-[#202722] leading-relaxed break-words">
                      {act.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="indent-2 sm:indent-3 break-words">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Murdle Deduction Brief & Key Takeaway */}
                    <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[#92400E] font-bold">
                        <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0" />
                        <span>Quick Clue & Key Takeaway</span>
                      </div>
                      <p className="text-[#78350F] leading-relaxed break-words">{act.section_brief}</p>
                    </div>

                    {/* Unlocked Clue Card with Everyday Intuitive Analogy */}
                    {act.unlocked_clue && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFBF8] border border-[#287A52]/30 space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF4EE] text-[#153D2E] break-words">
                            Unlocked Clue: {act.unlocked_clue.name}
                          </span>
                          <span className="text-[10px] font-semibold text-[#287A52] shrink-0">
                            Category: {act.unlocked_clue.type?.replace(/_/g, " ")}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-[#153D2E] break-words leading-relaxed">
                          {act.unlocked_clue.highlight_evidence}
                        </p>

                        {/* Everyday Analogy */}
                        {act.unlocked_clue.analogy_explanation && (
                          <div className="p-3.5 rounded-xl bg-white border border-[#E4E9E3] text-xs text-[#68736B] flex items-start gap-2.5 min-w-0">
                            <Sparkles className="w-4 h-4 text-[#287A52] shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1 leading-relaxed break-words">
                              <strong className="text-[#153D2E]">Intuitive Everyday Analogy:</strong>{" "}
                              {act.unlocked_clue.analogy_explanation}
                            </div>
                          </div>
                        )}

                        {act.unlocked_clue.grounded_fact && (
                          <div className="pt-2 border-t border-[#E4E9E3] text-[10px] text-[#287A52] break-words">
                            <strong>Grounded Course Fact:</strong> {act.unlocked_clue.grounded_fact}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paired Question Link */}
                    {pairedQuestion && (
                      <div className="pt-3 border-t border-[#E4E9E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBF8]/50 p-3.5 rounded-2xl min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Scale className="w-4 h-4 text-[#287A52] shrink-0" />
                          <span className="text-xs text-[#153D2E] font-medium break-words">
                            Paired Question #{pairedQuestion.question_number}: <strong>{pairedQuestion.title}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("questions");
                            setExpandedQuestion(pairedQuestion.id);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#153D2E] bg-[#EBF4EE] hover:bg-[#DCEBDD] border border-[#DCEBDD] transition-colors shrink-0"
                        >
                          <span>Review Question & Rubric ({pairedQuestion.max_marks || 25} pts)</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {/* Fallback Timeline & Observations for Legacy Cases */}
              {mysteryData?.timeline_and_observations && mysteryData.timeline_and_observations.length > 0 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E9E3] shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#287A52]" />
                    <span>Recorded Timeline & Telemetry Observations</span>
                  </h3>

                  <div className="space-y-3">
                    {mysteryData.timeline_and_observations.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] flex items-start gap-3 text-xs"
                      >
                        <span className="font-mono font-bold text-[#153D2E] shrink-0 bg-[#EBF4EE] px-2 py-1 rounded-md">
                          {item.timestamp_or_step}
                        </span>
                        <div className="flex-1">
                          <p className="text-[#202722]">{item.observation}</p>
                          {item.anomaly_detected && (
                            <p className="text-[11px] text-[#DC2626] font-semibold mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Anomaly Flag: {item.anomaly_detected}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clues & Evidence Matrix */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E9E3] shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#287A52]" />
                  <span>Grounded Clue & Evidence Cards</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mysteryData?.clues_and_evidence?.map((clue, idx) => (
                    <div
                      key={clue.id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        clue.is_anomaly
                          ? "bg-[#FFFBEB]/40 border-[#FDE68A]"
                          : "bg-[#FAFBF8] border-[#E4E9E3]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#153D2E]">
                          {clue.type.replace(/_/g, " ")}
                        </span>
                        {clue.is_anomaly && (
                          <span className="text-[10px] font-bold text-[#D97706] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Key Anomaly</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-[#153D2E] mb-1">{clue.name}</h4>
                      <p className="text-xs text-[#68736B] leading-relaxed">{clue.content}</p>

                      {clue.connected_fact_ids && clue.connected_fact_ids.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#E4E9E3] text-[10px] text-[#287A52]">
                          Grounded in: {clue.connected_fact_ids.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Confidential Teacher Canonical Solution */}
          {mysteryData?.canonical_solution && (
            <div className="p-6 rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#92400E] font-bold uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Confidential Teacher Solution & Root Cause Key</span>
              </div>
              <p className="text-[#78350F] leading-relaxed">
                {mysteryData.canonical_solution}
              </p>
              <p className="text-[10px] text-[#B45309] font-medium pt-1">
                * This solution is stored securely on the server and is never transmitted to student browsers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STRICT DESCRIPTIVE QUESTIONS & RUBRICS */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#EBF4EE] border border-[#BBF7D0] text-xs text-[#166534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22C55E]" />
            <span>
              All primary questions are strict descriptive open-ended inquiries requiring student reasoning and evidence citations.
            </span>
          </div>

          {mysteryData?.questions?.map((q: DescriptiveQuestion, idx: number) => {
            const isExpanded = expandedQuestion === q.id;
            return (
              <div
                key={q.id || idx}
                className="bg-white rounded-3xl border border-[#E4E9E3] shadow-xs overflow-hidden"
              >
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="p-5 sm:p-6 flex items-start justify-between cursor-pointer hover:bg-[#FAFBF8] transition-colors gap-4 min-w-0"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="w-7 h-7 rounded-xl bg-[#153D2E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      Q{q.question_number || idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#153D2E] shrink-0">
                          {q.question_type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-[#68736B] font-semibold shrink-0">
                          Max Marks: {q.max_marks || 25} pts
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#153D2E] leading-snug break-words">
                        {q.title || `Descriptive Challenge ${idx + 1}`}
                      </h4>
                      <p className="text-xs text-[#68736B] mt-1 line-clamp-2 break-words leading-relaxed">
                        {q.question_text}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-[#68736B] p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-[#E4E9E3] space-y-5 bg-[#FAFBF8]/30">
                    {/* Full Prompt */}
                    <div className="mt-4 p-4 rounded-2xl bg-white border border-[#E4E9E3] text-xs text-[#202722] leading-relaxed break-words">
                      <strong>Full Student Prompt:</strong> {q.question_text}
                    </div>

                    {/* Expected Reasoning & Required Evidence */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-white border border-[#E4E9E3] min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B] block mb-1">
                          Expected Analytical Reasoning
                        </span>
                        <p className="text-[#153D2E] break-words leading-relaxed">{q.expected_reasoning}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-[#E4E9E3] min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B] block mb-1">
                          Required Evidence Citations
                        </span>
                        <p className="text-[#153D2E] break-words leading-relaxed">
                          {(q.required_evidence_citations || []).join(", ") || "Case clues and data logs"}
                        </p>
                      </div>
                    </div>

                    {/* 4-Tier Marking Rubric */}
                    {q.rubric && (
                      <div className="p-5 rounded-2xl bg-white border border-[#E4E9E3] space-y-3 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                          <span className="text-xs font-bold text-[#153D2E] break-words">
                            Marking Rubric: {q.rubric.criteria_name}
                          </span>
                          <span className="text-[11px] text-[#68736B] break-words">{q.rubric.description}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {q.rubric.scoring_levels?.map((lvl, lIdx) => (
                            <div
                              key={lIdx}
                              className={`p-3 rounded-xl border text-xs space-y-1 min-w-0 ${
                                lvl.level_name === "Exemplary"
                                  ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                                  : lvl.level_name === "Proficient"
                                  ? "bg-[#EBF4EE] border-[#DCEBDD] text-[#153D2E]"
                                  : lvl.level_name === "Developing"
                                  ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                                  : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold gap-1">
                                <span className="truncate">{lvl.level_name}</span>
                                <span className="font-mono text-[10px] shrink-0">{lvl.score_range} pts</span>
                              </div>
                              <p className="text-[11px] leading-snug break-words">{lvl.descriptor}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Graduated Hints */}
                    {q.graduated_hints && q.graduated_hints.length > 0 && (
                      <div className="space-y-2 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B]">
                          Graduated Hint Ladder (Student Revealable)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {q.graduated_hints.map((hint, hIdx) => (
                            <div
                              key={hIdx}
                              className="p-3 rounded-xl bg-white border border-[#E4E9E3] text-xs space-y-1 min-w-0"
                            >
                              <span className="text-[10px] font-bold text-[#287A52] uppercase block">
                                Tier {hint.tier}: {hint.hint_type}
                              </span>
                              <p className="text-[11px] text-[#68736B] leading-relaxed break-words">{hint.hint_text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: GROUNDED LEARNING FACTS */}
      {activeTab === "facts" && (
        <div className="space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E9E3] shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#287A52] shrink-0" />
              <span>Evidence-Grounded Facts Extracted from Uploaded Coursework</span>
            </h3>
            <p className="text-xs text-[#68736B] mb-6 leading-relaxed">
              These verifiable statements were indexed and selected to ground the mystery case.
            </p>

            <div className="space-y-3">
              {approvedFacts.map((fact, idx) => (
                <div
                  key={fact.id || idx}
                  className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] space-y-2 min-w-0"
                >
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <p className="text-xs font-semibold text-[#153D2E] leading-relaxed break-words min-w-0 flex-1">
                      {fact.statement}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#153D2E] uppercase shrink-0">
                      {fact.fact_type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-[#68736B] pt-1">
                    <span className="shrink-0">Category: <strong className="text-[#153D2E]">{fact.concept_category}</strong></span>
                    {fact.page_or_section && <span className="shrink-0">Source: {fact.page_or_section}</span>}
                    <span className="text-[#287A52] font-semibold break-words">Objective: {fact.learning_objective}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT SUBMISSIONS LIST */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <div className="p-10 sm:p-14 rounded-3xl bg-white border border-dashed border-[#CCD5CD] text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF4EE] flex items-center justify-center mx-auto mb-3 text-[#153D2E]">
                <GraduationCap className="w-6 h-6 text-[#287A52]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#153D2E]">
                No student submissions yet
              </h3>
              <p className="text-xs sm:text-sm text-[#68736B] mt-1.5 max-w-sm mx-auto leading-relaxed">
                Copy the student link above and share it with your class. As soon as a student completes the questions, their answers will appear here in real time.
              </p>
              <button
                type="button"
                onClick={copyToClipboard}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#153D2E] text-white text-xs font-bold hover:bg-[#1C523E] transition-colors shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span>Copy Student Link</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#68736B]">
                <span>Showing {submissions.length} completed submission(s)</span>
              </div>

              {submissions.map((sub: any) => {
                const isExpanded = expandedSubmission === sub.id;
                const descriptiveAns = sub.descriptive_answers || {};
                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-3xl border border-[#E4E9E3] shadow-xs overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedSubmission(isExpanded ? null : sub.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-[#FAFBF8] transition-colors gap-4 min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] border border-[#DCEBDD] text-[#153D2E] font-bold text-sm flex items-center justify-center shrink-0">
                          {(sub.student_name || "Student").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[#153D2E] truncate">
                            {sub.student_name || "Anonymous Student"}
                          </h4>
                          <p className="text-[11px] text-[#68736B] truncate">
                            ID: <span className="font-mono">{sub.student_id_code}</span> • Submitted{" "}
                            {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{" "}
                            {new Date(sub.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap shrink-0 justify-between sm:justify-end">
                        {/* Tab Switch Anti-Cheat Badge */}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${
                            (sub.tab_switch_count || 0) > 0
                              ? "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                              : "bg-[#EBF4EE] text-[#166534] border-[#BBF7D0]"
                          }`}
                        >
                          {(sub.tab_switch_count || 0) > 0 ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                              <span>{sub.tab_switch_count} Focus Switches</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                              <span>Verified Focus</span>
                            </>
                          )}
                        </span>

                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#153D2E] text-white shrink-0">
                          Score: {sub.score}%
                        </span>
                        <div className="text-[#68736B] p-1 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-6 pt-0 border-t border-[#E4E9E3] space-y-4 bg-[#FAFBF8]/40 mt-2">
                        {/* Student Details & Telemetry Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div className="p-3.5 rounded-xl bg-white border border-[#E4E9E3] text-xs min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B]">
                              Student ID
                            </span>
                            <p className="font-mono font-bold text-[#153D2E] mt-0.5 truncate">
                              {sub.student_id_code || "N/A"}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white border border-[#E4E9E3] text-xs min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B]">
                              Time Spent on Investigation
                            </span>
                            <p className="font-bold text-[#153D2E] mt-0.5 truncate">
                              {Math.floor((sub.time_spent_seconds || 0) / 60)}m{" "}
                              {(sub.time_spent_seconds || 0) % 60}s
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white border border-[#E4E9E3] text-xs min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B]">
                              Integrity Status
                            </span>
                            <p
                              className={`font-bold mt-0.5 truncate ${
                                (sub.tab_switch_count || 0) > 0 ? "text-[#DC2626]" : "text-[#166534]"
                              }`}
                            >
                              {(sub.tab_switch_count || 0) === 0
                                ? "Zero Tab Switches"
                                : `${sub.tab_switch_count} Unfocused Window Events`}
                            </p>
                          </div>
                        </div>

                        {/* AI Feedback Banner */}
                        {sub.feedback && (
                          <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                              <span>Evaluation Assessment</span>
                            </div>
                            <p className="leading-relaxed break-words">{sub.feedback}</p>
                          </div>
                        )}

                        {/* Written Descriptive Responses */}
                        <div className="space-y-3 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#68736B]">
                            Student Descriptive Written Responses
                          </span>

                          {Object.entries(descriptiveAns).map(([qId, ansText], aIdx) => (
                            <div
                              key={qId}
                              className="p-4 rounded-2xl bg-white border border-[#E4E9E3] text-xs space-y-2 min-w-0"
                            >
                              <div className="font-bold text-[#153D2E] break-words">
                                Response to Challenge #{aIdx + 1} ({qId})
                              </div>
                              <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#DCEBDD] text-[#202722] leading-relaxed whitespace-pre-wrap break-words">
                                {String(ansText)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DELETE ASSIGNMENT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E4E9E3] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteModal(false);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-[#68736B] hover:text-[#202722] hover:bg-[#FAFBF8] transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#153D2E]">
                Delete Assignment?
              </h3>
              <p className="text-xs text-[#68736B] mt-1.5 leading-relaxed break-words">
                Are you sure you want to permanently delete{" "}
                <strong className="text-[#153D2E]">
                  &ldquo;{assignment.title}&rdquo;
                </strong>
                ? This will remove the mystery case, clues, and all student submissions. This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs break-words">
                {deleteError}
              </div>
            )}

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-[#68736B] hover:text-[#202722] hover:bg-[#FAFBF8] border border-[#E4E9E3] transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAssignment}
                disabled={isDeleting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors shadow-xs disabled:opacity-60 text-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Assignment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
