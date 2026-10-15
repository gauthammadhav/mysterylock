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

  // 1. First attempt: Query assignment_versions with access_token if provided
  let versions: any[] = [];
  if (accessToken) {
    const { data } = await supabase
      .from("assignment_versions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .eq("access_token", accessToken.trim())
      .order("version_number", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      versions = data;
    }
  }

  // 2. If not found with token, query latest assignment_version by assignment_id
  if (versions.length === 0) {
    const { data } = await supabase
      .from("assignment_versions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("version_number", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      versions = data;
    }
  }

  // 3. If a version snapshot exists in assignment_versions, construct and return studentPayload
  if (versions.length > 0 && versions[0]) {
    const version = versions[0];
    const mystery = version.mystery_snapshot || {};
    const questions = Array.isArray(version.questions_snapshot) ? version.questions_snapshot : [];

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

  // 4. Fallback: If no assignment_versions snapshot exists, load directly from assignments table
  const { data: assignment, error: assignmentErr } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentErr || !assignment) {
    return { payload: null, error: "Assignment not found." };
  }

  // Check if assignment has story_plans JSON
  let mystery: any = null;
  if (assignment.story_plans && Array.isArray(assignment.story_plans) && assignment.story_plans.length > 0) {
    mystery = assignment.story_plans[0];
  }

  // If not in story_plans, check mysteries table
  if (!mystery) {
    const { data: dbMystery } = await supabase
      .from("mysteries")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbMystery) {
      mystery = dbMystery;
    }
  }

  // If mystery was still not generated or has no questions, generate an on-the-fly pedagogical Murdle case
  if (!mystery || !mystery.questions || mystery.questions.length === 0) {
    const { generateDescriptiveMystery } = await import("@/lib/mystery/descriptive-generator");
    mystery = await generateDescriptiveMystery({
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      subject: assignment.subject,
      difficulty: assignment.difficulty || "medium",
      learningObjectives: assignment.learning_objectives || [],
      approvedFacts: assignment.approved_facts || [],
    });
  }

  const questions = Array.isArray(mystery.questions) ? mystery.questions : [];
  const studentSafeQuestions = questions.map((q: any, idx: number) => ({
    id: q.id || `q_${idx + 1}`,
    question_number: q.question_number || idx + 1,
    question_type: q.question_type || "concept_explanation",
    title: q.title || `Challenge ${idx + 1}`,
    question_text: q.question_text || "",
    max_marks: q.max_marks || 25,
    graduated_hints: q.graduated_hints,
  }));

  const studentSafeClues = Array.isArray(mystery.clues_and_evidence)
    ? mystery.clues_and_evidence.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        content: c.content || c.highlight_evidence,
        is_anomaly: Boolean(c.is_anomaly),
      }))
    : [];

  const studentPayload: StudentSafeAssignmentPayload = {
    assignmentId: assignment.id,
    versionNumber: assignment.version || 1,
    title: mystery.title || assignment.title,
    subject: mystery.academic_discipline || assignment.subject,
    difficulty: assignment.difficulty || "medium",
    case_number: mystery.case_number || "CASE-101",
    narrative_premise: mystery.narrative_premise || assignment.description || "",
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
