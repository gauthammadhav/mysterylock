import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentSolverClient from "./StudentSolverClient";
import { Loader2 } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SolveAssignmentPage({ params }: Props) {
  const { id: assignmentId } = await params;
  const supabase = await createClient();

  const { data: assignment, error } = await supabase
    .from("assignments")
    .select("id, title, subject, difficulty, course_name, description, learning_objectives, status")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error || !assignment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFBF8] text-[#202722] selection:bg-[#DCEBDD] selection:text-[#153D2E]">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#287A52]" />
          </div>
        }
      >
        <StudentSolverClient assignment={assignment} />
      </Suspense>
    </div>
  );
}
