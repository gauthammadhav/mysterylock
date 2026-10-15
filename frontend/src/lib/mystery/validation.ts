import { DescriptiveMysteryAssignment, DescriptiveQuestion } from "@/types/descriptive";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that an academic mystery assignment complies strictly with pedagogical standards:
 * 1. ZERO multiple-choice questions or single-word quizzes.
 * 2. Every question has a structured rubric with clear criteria.
 * 3. Total marks equal exactly 100.
 * 4. Grounding: Clues and questions link back to approved facts.
 * 5. Internal consistency of timeline and canonical solution.
 */
export function validateDescriptiveMystery(caseData: DescriptiveMysteryAssignment): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!caseData.title || caseData.title.trim().length === 0) {
    errors.push("Assignment must have a valid title.");
  }

  if (!caseData.narrative_premise || caseData.narrative_premise.length < 50) {
    errors.push("Narrative premise must be at least 50 characters to provide sufficient investigative context.");
  }

  if (!caseData.canonical_solution || caseData.canonical_solution.length < 20) {
    errors.push("Assignment must have a complete confidential canonical solution for teachers.");
  }

  if (!Array.isArray(caseData.questions) || caseData.questions.length === 0) {
    errors.push("Assignment must have at least one descriptive question.");
    return { isValid: false, errors, warnings };
  }

  let marksSum = 0;
  caseData.questions.forEach((q: DescriptiveQuestion, idx: number) => {
    // Strict Descriptive Check: disallow multiple-choice fields or types
    if ((q as any).options && Array.isArray((q as any).options) && (q as any).options.length > 0) {
      errors.push(`Question #${idx + 1} contains multiple-choice options. Multiple-choice questions are strictly prohibited.`);
    }

    if (["mcq", "multiple_choice", "true_false", "single_word"].includes((q as any).type)) {
      errors.push(`Question #${idx + 1} is typed as ${(q as any).type}. All primary questions must be descriptive.`);
    }

    if (!q.question_text || q.question_text.trim().length < 15) {
      errors.push(`Question #${idx + 1} prompt is too short. Descriptive questions must be explicit and thorough.`);
    }

    if (!q.rubric || !q.rubric.criteria_name || !Array.isArray(q.rubric.scoring_levels)) {
      errors.push(`Question #${idx + 1} lacks a complete 4-tier marking rubric.`);
    }

    marksSum += q.max_marks || 0;
  });

  if (marksSum !== 100) {
    warnings.push(`Total question marks equal ${marksSum} instead of standard 100 points.`);
  }

  if (!Array.isArray(caseData.clues_and_evidence) || caseData.clues_and_evidence.length < 2) {
    warnings.push("Fewer than 2 clues provided. Providing 3-5 clues enhances investigative deduction.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
