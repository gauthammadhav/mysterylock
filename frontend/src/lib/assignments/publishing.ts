import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { DescriptiveMysteryAssignment } from "@/types/descriptive";
import { ExtractedFact } from "@/types/facts";

export interface PublishResult {
  success: boolean;
  accessToken: string;
  shareableUrl: string;
  versionNumber: number;
  error?: string;
}

/**
 * Publishes an approved assignment:
 * 1. Generates an unguessable cryptographic access token.
 * 2. Creates an immutable version snapshot in `assignment_versions`.
 * 3. Updates `assignments` status to 'published' with timestamp.
 */
export async function publishAssignmentVersion(
  assignmentId: string,
  teacherId: string,
  mysteryData: DescriptiveMysteryAssignment,
  approvedFacts: ExtractedFact[]
): Promise<PublishResult> {
  const supabase = await createClient();

  // 1. Verify teacher ownership and assignment state
  const { data: assignment, error: fetchErr } = await supabase
    .from("assignments")
    .select("id, title, subject, difficulty, version, teacher_id")
    .eq("id", assignmentId)
    .eq("teacher_id", teacherId)
    .single();

  if (fetchErr || !assignment) {
    return {
      success: false,
      accessToken: "",
      shareableUrl: "",
      versionNumber: 1,
      error: "Assignment not found or unauthorized.",
    };
  }

  // 2. Generate unguessable 32-character access token
  const accessToken = `ml_${crypto.randomBytes(16).toString("hex")}`;
  const nextVersion = (assignment.version || 0) + 1;

  // 3. Snapshot assignment into assignment_versions
  const { error: versionErr } = await supabase.from("assignment_versions").insert({
    assignment_id: assignmentId,
    version_number: nextVersion,
    access_token: accessToken,
    title: mysteryData.title || assignment.title,
    subject: mysteryData.academic_discipline || assignment.subject,
    difficulty: assignment.difficulty,
    approved_facts: approvedFacts,
    mystery_snapshot: {
      case_number: mysteryData.case_number,
      narrative_premise: mysteryData.narrative_premise,
      setting_context: mysteryData.setting_context,
      investigative_role: mysteryData.investigative_role,
      timeline_and_observations: mysteryData.timeline_and_observations,
      clues_and_evidence: mysteryData.clues_and_evidence,
      canonical_solution: mysteryData.canonical_solution, // Stored safely on server snapshot only
      story_acts: mysteryData.story_acts || [],
      total_marks: mysteryData.total_marks,
    },
    questions_snapshot: mysteryData.questions,
    rubric_snapshot: {
      questions: mysteryData.questions.map((q) => ({
        id: q.id,
        rubric: q.rubric,
        max_marks: q.max_marks,
      })),
    },
  });

  if (versionErr) {
    console.error("Error creating assignment version snapshot:", versionErr);
    return {
      success: false,
      accessToken: "",
      shareableUrl: "",
      versionNumber: nextVersion,
      error: versionErr.message || "Failed to create immutable assignment version snapshot.",
    };
  }

  // 4. Update parent assignment record
  const { error: updateErr } = await supabase
    .from("assignments")
    .update({
      status: "published",
      access_token: accessToken,
      version: nextVersion,
      published_at: new Date().toISOString(),
      approved_facts: approvedFacts,
    })
    .eq("id", assignmentId);

  if (updateErr) {
    console.warn("Assignment parent record update warning:", updateErr);
  }

  const shareableUrl = `/solve/${assignmentId}?token=${accessToken}`;

  return {
    success: true,
    accessToken,
    shareableUrl,
    versionNumber: nextVersion,
  };
}
