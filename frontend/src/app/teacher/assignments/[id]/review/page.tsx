import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Compass,
  FileCheck2,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Puzzle,
  Scale,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import ReviewClientWrapper from "./ReviewClientWrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentReviewPage({ params }: PageProps) {
  const { id: assignmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/teacher/assignments/${assignmentId}/review`);
  }

  // 1. Fetch assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignmentId)
    .eq("teacher_id", user.id)
    .single();

  if (assignmentError || !assignment) {
    notFound();
  }

  // 2. Fetch mystery and submissions in parallel
  const [mysteryRes, submissionsRes] = await Promise.all([
    supabase
      .from("mysteries")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false }),
  ]);

  const mystery = mysteryRes?.data || null;
  const submissions = submissionsRes?.data || [];

  // 3. If mystery exists, fetch checkpoints and variants in parallel
  let checkpoints: any[] = [];
  let variants: any[] = [];

  if (mystery) {
    const [checkpointsRes, variantsRes] = await Promise.all([
      supabase
        .from("checkpoints")
        .select("*")
        .eq("mystery_id", mystery.id)
        .order("stage_index", { ascending: true }),
      supabase
        .from("student_variants")
        .select("*")
        .eq("mystery_id", mystery.id)
        .order("variant_index", { ascending: true })
        .limit(2),
    ]);
    checkpoints = checkpointsRes?.data || [];
    variants = variantsRes?.data || [];
  }

  return (
    <div className="min-h-screen bg-[#FAFBF8] text-[#202722] selection:bg-[#DCEBDD] selection:text-[#153D2E] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E4E9E3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/teacher/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#68736B] hover:text-[#153D2E] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shrink-0 ${
                assignment.status === "published"
                  ? "bg-[#EBF4EE] text-[#166534] border-[#BBF7D0]"
                  : "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
              }`}
            >
              {assignment.status}
            </span>
            <span className="text-xs font-semibold text-[#68736B] hidden sm:inline-block truncate max-w-[180px]" title={assignment.subject}>
              {assignment.subject}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <ReviewClientWrapper
          assignment={assignment}
          mystery={mystery}
          checkpoints={checkpoints || []}
          variants={variants || []}
          submissions={submissions || []}
        />
      </main>
    </div>
  );
}
