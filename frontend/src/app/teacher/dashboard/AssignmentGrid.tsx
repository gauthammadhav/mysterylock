"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FilePlus2,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  course_name?: string;
  difficulty: string;
  status: string;
  description?: string;
  learning_objectives?: any;
  created_at?: string;
  due_at?: string;
  access_token?: string;
  submission_count?: number;
}

interface Props {
  initialAssignments: Assignment[];
}

export default function AssignmentGrid({ initialAssignments }: Props) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const publishedCount = useMemo(
    () => assignments.filter((a) => a.status === "published").length,
    [assignments]
  );
  const draftCount = useMemo(
    () => assignments.filter((a) => a.status === "draft").length,
    [assignments]
  );

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // Status filter
      if (statusFilter !== "all" && a.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = a.title?.toLowerCase().includes(query);
        const matchesSubject = a.subject?.toLowerCase().includes(query);
        const matchesCourse = a.course_name?.toLowerCase().includes(query);
        const matchesDesc = a.description?.toLowerCase().includes(query);
        return matchesTitle || matchesSubject || matchesCourse || matchesDesc;
      }
      return true;
    });
  }, [assignments, statusFilter, searchQuery]);

  const handleCopyStudentLink = (assignment: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const tokenQuery = assignment.access_token ? `?token=${assignment.access_token}` : "";
    const url = `${origin}/solve/${assignment.id}${tokenQuery}`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(assignment.id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === assignment.id ? null : curr));
      }, 2500);
    }
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/assignments/${assignmentToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete assignment.");
      }

      // Remove from local state
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentToDelete.id));
      setAssignmentToDelete(null);
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete assignment.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="p-8 sm:p-14 rounded-3xl bg-white border border-dashed border-[#CCD5CD] text-center max-w-xl mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#EBF4EE] border border-[#DCEBDD] text-[#153D2E] flex items-center justify-center mx-auto mb-4">
          <FilePlus2 className="w-7 h-7 text-[#287A52]" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#153D2E]">
          No mystery assignments created yet
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#68736B] leading-relaxed mb-6 max-w-md mx-auto">
          Upload your syllabus or lecture notes to extract learning objectives and
          generate your first authentic investigation.
        </p>
        <Link
          href="/teacher/assignments/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#2EE6A8] shrink-0" />
          <span>Create Your First Mystery</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-[#E4E9E3] shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAFBF8] rounded-xl border border-[#E4E9E3] overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === "all"
                ? "bg-white text-[#153D2E] shadow-2xs border border-[#DCEBDD]"
                : "text-[#68736B] hover:text-[#153D2E]"
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === "published"
                ? "bg-[#EBF4EE] text-[#166534] shadow-2xs border border-[#BBF7D0]"
                : "text-[#68736B] hover:text-[#166534]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span>Published ({publishedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === "draft"
                ? "bg-[#FFFBEB] text-[#92400E] shadow-2xs border border-[#FDE68A]"
                : "text-[#68736B] hover:text-[#92400E]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            <span>Drafts ({draftCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-0 sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#68736B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, subject, course..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] text-[#202722] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#287A52] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#202722] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty State after Filtering */}
      {filteredAssignments.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-dashed border-[#CCD5CD] text-center max-w-md mx-auto shadow-xs my-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] text-[#68736B] flex items-center justify-center mx-auto mb-3">
            <Filter className="w-5 h-5 text-[#68736B]" />
          </div>
          <h4 className="text-sm font-bold text-[#153D2E]">No matching mystery cases</h4>
          <p className="mt-1 text-xs text-[#68736B] leading-relaxed">
            No assignments match your current filter and search criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-[#153D2E] bg-[#EBF4EE] hover:bg-[#DCEBDD] border border-[#DCEBDD] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((assignment) => {
            const isPublished = assignment.status === "published";
            const isCopied = copiedId === assignment.id;
            const solveUrl = `/solve/${assignment.id}${assignment.access_token ? `?token=${assignment.access_token}` : ""}`;
            const formattedDate = assignment.created_at
              ? new Date(assignment.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={assignment.id}
                className="relative p-5 sm:p-6 rounded-2xl bg-white border border-[#E4E9E3] shadow-xs hover:border-[#287A52] hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden"
              >
                <div className="min-w-0">
                  {/* Header Badges & Delete Button */}
                  <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          isPublished
                            ? "bg-[#EBF4EE] text-[#166534] border border-[#BBF7D0]"
                            : "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]"
                        }`}
                      >
                        {assignment.status}
                      </span>
                      <span className="text-[11px] text-[#68736B] capitalize shrink-0 font-medium">
                        {assignment.difficulty}
                      </span>
                      {assignment.course_name && (
                        <span className="text-[10px] font-semibold text-[#153D2E] bg-[#FAFBF8] px-2 py-0.5 rounded-md border border-[#E4E9E3] truncate max-w-[130px]">
                          {assignment.course_name}
                        </span>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setAssignmentToDelete(assignment);
                        setDeleteError(null);
                      }}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors shrink-0"
                      title={`Delete ${assignment.title}`}
                      aria-label="Delete assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Description Clickable to Review Studio */}
                  <Link
                    href={`/teacher/assignments/${assignment.id}/review`}
                    className="block min-w-0 focus:outline-none"
                  >
                    <h4 className="font-bold text-[#153D2E] text-base line-clamp-2 group-hover:text-[#287A52] transition-colors break-words leading-snug">
                      {assignment.title}
                    </h4>
                    <p className="text-xs text-[#68736B] mt-2 line-clamp-2 leading-relaxed break-words">
                      {assignment.description || "Curriculum-grounded mystery investigation."}
                    </p>
                  </Link>
                </div>

                {/* Footer Metadata & Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-[#E4E9E3] space-y-3 min-w-0">
                  {/* Subject, Objectives & Submissions */}
                  <div className="flex items-center justify-between text-xs text-[#68736B] gap-2 min-w-0 flex-wrap">
                    <span className="truncate max-w-[55%] font-medium text-[#153D2E]" title={assignment.subject}>
                      {assignment.subject}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-semibold text-[#68736B] bg-[#FAFBF8] px-2 py-0.5 rounded-md border border-[#E4E9E3]">
                        {Array.isArray(assignment.learning_objectives)
                          ? `${assignment.learning_objectives.length} Objectives`
                          : "0 Objectives"}
                      </span>
                      {assignment.submission_count !== undefined && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            assignment.submission_count > 0
                              ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                              : "bg-[#FAFBF8] text-[#68736B] border-[#E4E9E3]"
                          }`}
                        >
                          <Users className="w-3 h-3 shrink-0" />
                          <span>{assignment.submission_count}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date information */}
                  {formattedDate && (
                    <div className="text-[10px] text-[#9CA3AF]">
                      Created {formattedDate}
                    </div>
                  )}

                  {/* Quick Action: Share/Copy Link if Published */}
                  {isPublished && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleCopyStudentLink(assignment, e)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isCopied
                            ? "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]"
                            : "bg-[#FAFBF8] text-[#153D2E] hover:bg-[#EBF4EE] border-[#DCEBDD]"
                        }`}
                        title="Copy student link to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                            <span>Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#287A52] shrink-0" />
                            <span>Copy Student Link</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={solveUrl}
                        target="_blank"
                        className="p-1.5 rounded-lg text-[#68736B] hover:text-[#153D2E] hover:bg-[#FAFBF8] border border-[#E4E9E3] transition-colors shrink-0"
                        title="Preview student solver in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {/* Primary Studio Action */}
                  <Link
                    href={`/teacher/assignments/${assignment.id}/review`}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#153D2E] bg-[#FAFBF8] group-hover:bg-[#153D2E] group-hover:text-white border border-[#E4E9E3] group-hover:border-[#153D2E] transition-all shadow-2xs"
                  >
                    <span>Open Assignment Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#287A52] group-hover:text-[#2EE6A8] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {assignmentToDelete && (
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
                    setAssignmentToDelete(null);
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
                  &ldquo;{assignmentToDelete.title}&rdquo;
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
                  setAssignmentToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-[#68736B] hover:text-[#202722] hover:bg-[#FAFBF8] border border-[#E4E9E3] transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
    </>
  );
}
