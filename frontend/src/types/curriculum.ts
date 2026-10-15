/**
 * Types and interfaces for Curriculum Ingestion, Learning Objectives, and Grounded RAG
 */

export type BloomTaxonomyLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create";

export interface LearningObjectiveItem {
  id: string;
  title: string;
  description: string;
  bloom_level: BloomTaxonomyLevel;
  source_excerpt?: string;
  is_selected: boolean;
}

export interface IngestionResult {
  assignmentId?: string;
  fileName: string;
  fileSize: number;
  extractedTextLength: number;
  previewExcerpt: string;
  learningObjectives: LearningObjectiveItem[];
}
