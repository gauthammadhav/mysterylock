/**
 * Types and interfaces for Grounded Mysteries, Checkpoints, and Student Variations
 */

export type PuzzleType =
  | "constructed_response"
  | "evidence_selection"
  | "data_interpretation"
  | "sequence";

export interface ClueItem {
  id: string;
  name: string;
  type: "document" | "data_log" | "physical_evidence" | "witness_statement" | "sensor_reading";
  description: string;
  content: string;
  is_distractor?: boolean;
}

export interface HintTier {
  tier: 1 | 2 | 3;
  name: "Conceptual Nudge" | "Guiding Question" | "Direct Clue Reference";
  text: string;
}

export interface CheckpointBlueprint {
  id?: string;
  stage_index: number;
  title: string;
  puzzle_type: PuzzleType;
  target_learning_objective: string;
  narrative_stage: string;
  clues: ClueItem[];
  prompt_question: string;
  rubric_criteria: {
    criterion_name: string;
    points: number;
    key_evidence_required: string;
    expected_reasoning: string;
  };
  hint_ladder: HintTier[];
  canonical_answer?: string;
}

export interface MysteryBlueprint {
  id?: string;
  assignment_id: string;
  title: string;
  narrative_premise: string;
  setting_context: string;
  canonical_solution: string;
  rubric_definition: {
    core_points: number; // 90
    extension_points: number; // 10
    total_points: number; // 100
  };
  total_stages: number;
  checkpoints: CheckpointBlueprint[];
}

export interface StudentVariant {
  id?: string;
  mystery_id: string;
  seed: string;
  variant_index: number;
  narrative_overrides: {
    detective_role: string;
    location_name: string;
    organization_name: string;
    timestamp_epoch: string;
  };
  checkpoint_variants: {
    stage_index: number;
    varied_clues: ClueItem[];
    numerical_overrides?: Record<string, number | string>;
    sequence_items?: string[];
  }[];
}
