import { createClient } from "@/lib/supabase/server";

export interface StudentSafeAssignmentPayload {
  assignmentId: string;
  versionNumber: number;
  title: string;
  subject: string;
  difficulty: string;
  case_number: string;
  narrative_premise: string;
  investigative_role: string;
  setting_context: string;
  timeline_and_observations: {
    timestamp_or_step: string;
    observation: string;
    anomaly_detected?: string;
  }[];
  clues_and_evidence: {
    id: string;
    name: string;
    type: string;
    content: string;
    is_anomaly: boolean;
  }[];
  questions: {
    id: string;
    question_number: number;
    question_type: string;
    title: string;
    question_text: string;
    max_marks: number;
    graduated_hints?: {
      tier: number;
      hint_type: string;
      hint_text: string;
    }[];
  }[];
  story_acts?: import("@/types/descriptive").NarrativeAct[];
  total_marks: number;
}

/**
 * Validates student access and returns a sanitized, student-safe assignment payload.
 * STRICT SECURITY: Canonical solution, teacher rubrics, and internal prompts are NEVER included.
 */
export async function getStudentSafeAssignment(
  assignmentId: string,
  accessToken?: string | null
): Promise<{ payload: StudentSafeAssignmentPayload | null; error?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("assignment_versions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("version_number", { ascending: false })
    .limit(1);

  if (accessToken) {
    query = query.eq("access_token", accessToken);
  }

  const { data: versions, error } = await query;

  if (error || !versions || versions.length === 0) {
    // Check if the assignment is published in assignments table as fallback
    const { data: assignment } = await supabase
      .from("assignments")
      .select("id, title, subject, difficulty, status, access_token")
      .eq("id", assignmentId)
      .eq("status", "published")
      .maybeSingle();

    if (!assignment) {
      return { payload: null, error: "Assignment not found or has not been published yet." };
    }
  }

  const version = versions?.[0];
  if (!version) {
    return { payload: null, error: "Published version snapshot could not be found." };
  }

  const mystery = version.mystery_snapshot || {};
  const questions = Array.isArray(version.questions_snapshot) ? version.questions_snapshot : [];

  // Strip all confidential teacher-only fields
  const studentSafeQuestions = questions.map((q: any) => ({
    id: q.id,
    question_number: q.question_number,
    question_type: q.question_type,
    title: q.title,
    question_text: q.question_text,
    max_marks: q.max_marks || 25,
    graduated_hints: q.graduated_hints,
  }));

  const studentSafeClues = Array.isArray(mystery.clues_and_evidence)
    ? mystery.clues_and_evidence.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        content: c.content,
        is_anomaly: Boolean(c.is_anomaly),
      }))
    : [];

  const studentPayload: StudentSafeAssignmentPayload = {
    assignmentId: version.assignment_id,
    versionNumber: version.version_number,
    title: version.title,
    subject: version.subject,
    difficulty: version.difficulty,
    case_number: mystery.case_number || "CASE-101",
    narrative_premise: mystery.narrative_premise || "",
    investigative_role: mystery.investigative_role || "Investigator",
    setting_context: mystery.setting_context || "",
    timeline_and_observations: mystery.timeline_and_observations || [],
    clues_and_evidence: studentSafeClues,
    story_acts: Array.isArray(mystery.story_acts) ? mystery.story_acts : [],
    questions: studentSafeQuestions,
    total_marks: mystery.total_marks || 100,
  };

  return { payload: studentPayload };
}
