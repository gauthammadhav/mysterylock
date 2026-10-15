/**
 * Types and interfaces for Educational Fact Extraction, Validation, and Objective Mapping
 */

export type FactType =
  | "definition"
  | "mechanism"
  | "causal_relationship"
  | "comparison"
  | "application";

export type FactDifficulty = "introductory" | "intermediate" | "advanced";

export interface ExtractedFact {
  id: string; // e.g. "fact_1", "fact_2"
  statement: string;
  fact_type: FactType;
  concept_category: string;
  source_chunk_ids: string[];
  page_or_section?: string;
  learning_objective: string;
  prerequisites: string[];
  potential_misconceptions: string[];
  suggested_difficulty: FactDifficulty;
  assessment_opportunities: string[];
  is_approved: boolean;
  is_selected: boolean;
  citation_excerpt?: string;
  relevance_score?: number;
}

export interface FactExtractionResult {
  facts: ExtractedFact[];
  unsupported_claims?: string[];
  coverage_summary: {
    total_facts: number;
    covered_objectives: string[];
    missing_objectives: string[];
  };
}
