/**
 * Types and interfaces for Strict Descriptive Questions, Rubrics, and Murdle-Inspired Narrative Acts
 */

export type DescriptiveQuestionType =
  | "concept_explanation"        // Explain underlying concept or mechanism
  | "process_relation"           // Describe how two events/processes connect
  | "evidence_interpretation"    // Interpret piece of experimental or field evidence
  | "competing_hypotheses"       // Compare alternative explanations and rule out false ones
  | "plausible_conclusion"       // Identify most plausible conclusion and justify with evidence
  | "counterfactual_prediction"  // Predict outcome if a condition or variable changed
  | "experimental_design";       // Recommend a controlled experiment or field test

export interface DescriptiveQuestion {
  id: string; // e.g. "q_1", "q_2"
  question_number: number;
  question_type: DescriptiveQuestionType;
  title: string;
  question_text: string;
  target_learning_objectives: string[];
  grounded_fact_ids: string[];
  expected_reasoning: string;
  required_evidence_citations: string[];
  max_marks: number;
  difficulty: "introductory" | "intermediate" | "advanced";
  rubric: {
    criteria_name: string;
    description: string;
    scoring_levels: {
      score_range: string;
      level_name: "Exemplary" | "Proficient" | "Developing" | "Insufficient";
      descriptor: string;
    }[];
  };
  graduated_hints?: {
    tier: 1 | 2 | 3;
    hint_type: "Conceptual Prompt" | "Evidence Direction" | "Reasoning Guide";
    hint_text: string;
  }[];
}

export interface NarrativeAct {
  act_number: number;
  title: string; // e.g. "Act I: The Experimental Baseline"
  paragraphs: string[]; // Substantial academic narrative (2-3 paragraphs per act)
  section_brief: string; // Brief takeaway / hint summarizing the observations
  unlocked_clue: {
    id: string;
    name: string;
    type: "specimen_sample" | "observation_log" | "sensor_reading" | "historical_document" | "field_test";
    highlight_evidence: string; // Empirical finding
    analogy_explanation: string; // Simple, relatable analogy making the concept intuitive
    is_anomaly?: boolean;
    grounded_fact?: string;
  };
  related_question_id: string;
}

export interface DescriptiveMysteryAssignment {
  id?: string;
  assignment_id: string;
  title: string;
  case_number: string;
  narrative_premise: string;
  academic_discipline: string;
  setting_context: string;
  investigative_role: string;
  story_acts: NarrativeAct[]; // Multi-chapter passage with embedded clues & briefs
  timeline_and_observations: {
    timestamp_or_step: string;
    observation: string;
    anomaly_detected?: string;
  }[];
  clues_and_evidence: {
    id: string;
    name: string;
    type: "specimen_sample" | "observation_log" | "sensor_reading" | "historical_document" | "field_test";
    content: string;
    connected_fact_ids: string[];
    is_anomaly: boolean;
  }[];
  questions: DescriptiveQuestion[];
  canonical_solution: string; // Teacher-only: Full explanation of root cause
  total_marks: number;
}
