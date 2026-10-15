import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import AssignmentGrid from "./AssignmentGrid";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FilePlus2,
  FolderKanban,
  GraduationCap,
  LogOut,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/teacher/dashboard");
  }

  // Fetch teacher's assignments
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  const teacherName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Professor";
  const institution = user.user_metadata?.institution || "Mystery Learning Educator";

  const totalAssignments = assignments?.length || 0;
  const publishedAssignments =
    assignments?.filter((a) => a.status === "published").length || 0;
  const draftAssignments =
    assignments?.filter((a) => a.status === "draft").length || 0;

  // Fetch total submissions count for these assignments
  const assignmentIds = (assignments || []).map((a) => a.id);
  const submissionCountMap: Record<string, number> = {};
  let totalSubmissions = 0;

  if (assignmentIds.length > 0) {
    try {
      const { data: subData } = await supabase
        .from("submissions")
        .select("assignment_id")
        .in("assignment_id", assignmentIds);

      if (subData) {
        totalSubmissions = subData.length;
        subData.forEach((s) => {
          submissionCountMap[s.assignment_id] = (submissionCountMap[s.assignment_id] || 0) + 1;
        });
      }
    } catch (e) {
      console.warn("Could not fetch submission counts:", e);
    }
  }

  const assignmentsWithCounts = (assignments || []).map((a) => ({
    ...a,
    submission_count: submissionCountMap[a.id] || 0,
  }));

  const userInitials = teacherName
    .split(" ")
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ED";

  return (
    <div className="min-h-screen bg-[#FAFBF8] text-[#202722] selection:bg-[#DCEBDD] selection:text-[#153D2E]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E4E9E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#153D2E] border border-[#287A52]/40 flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#2EE6A8]">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="#2EE6A8" />
                </svg>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold tracking-tight text-[#153D2E]">mystery</span>
                <span className="text-xl font-medium tracking-tight text-[#287A52]">learning</span>
              </div>
            </Link>

            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EBF4EE] text-[#153D2E] border border-[#DCEBDD] shrink-0">
              Teacher Workspace
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <Link
              href="/teacher/assignments/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] transition-all shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#2EE6A8]" />
              <span>New Mystery</span>
            </Link>

            <div className="flex items-center gap-2.5 pl-1 sm:pl-3 sm:border-l sm:border-[#E4E9E3]">
              <div className="w-8 h-8 rounded-full bg-[#153D2E] text-[#2EE6A8] text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                {userInitials}
              </div>

              <div className="hidden md:flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-[#153D2E] truncate max-w-[170px] leading-tight">
                  {teacherName}
                </span>
                <span className="text-[11px] text-[#68736B] truncate max-w-[170px] leading-tight">
                  {user.email}
                </span>
              </div>
            </div>

            <form action={signOutAction} className="shrink-0">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#68736B] hover:text-[#991B1B] hover:bg-[#FEF2F2] rounded-xl border border-[#E4E9E3] transition-colors"
                title="Sign out of Teacher Workspace"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#153D2E] via-[#1A4B39] to-[#13382A] text-white shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle cx="200" cy="200" r="160" stroke="#2EE6A8" strokeWidth="2" fill="none" />
              <circle cx="200" cy="200" r="120" stroke="#2EE6A8" strokeWidth="1.5" strokeDasharray="8 8" fill="none" />
              <circle cx="200" cy="200" r="60" stroke="#2EE6A8" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2EE6A8]/15 border border-[#2EE6A8]/30 text-[#2EE6A8] text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Authentication Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
              Welcome back, {teacherName}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#DCEBDD] leading-relaxed break-words">
              {institution} • Manage your curriculum-grounded investigations, inspect student
              evidence trails, and author personalized learning blueprints.
            </p>
          </div>
        </div>

        {/* Metric Cards - 4 Column Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col justify-between hover:border-[#CCD5CD] transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#68736B] uppercase tracking-wider truncate">
                Total Cases
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EBF4EE] flex items-center justify-center text-[#153D2E] shrink-0">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-[#153D2E]">{totalAssignments}</p>
              <p className="mt-1 text-[11px] text-[#68736B] truncate">In teacher studio</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col justify-between hover:border-[#CCD5CD] transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#68736B] uppercase tracking-wider truncate">
                Published & Active
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EBF4EE] flex items-center justify-center text-[#287A52] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-[#287A52]">{publishedAssignments}</p>
              <p className="mt-1 text-[11px] text-[#68736B] truncate">Live investigations</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col justify-between hover:border-[#CCD5CD] transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#68736B] uppercase tracking-wider truncate">
                Drafts in Review
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center text-[#D97706] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-[#D97706]">{draftAssignments}</p>
              <p className="mt-1 text-[11px] text-[#68736B] truncate">Pending publication</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col justify-between hover:border-[#CCD5CD] transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#68736B] uppercase tracking-wider truncate">
                Student Submissions
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-[#2563EB]">{totalSubmissions}</p>
              <p className="mt-1 text-[11px] text-[#68736B] truncate">Evaluated answers</p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#153D2E] tracking-tight">Your Mystery Assignments</h2>
            <p className="text-xs text-[#68736B] mt-0.5 leading-relaxed">
              Curriculum-grounded, multi-checkpoint cases with individualized student variants.
            </p>
          </div>

          <Link
            href="/teacher/assignments/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] transition-all shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#2EE6A8] shrink-0" />
            <span>New Assignment</span>
          </Link>
        </div>

        {/* Assignments List or Empty State */}
        <AssignmentGrid initialAssignments={assignmentsWithCounts} />
      </main>
    </div>
  );
}
