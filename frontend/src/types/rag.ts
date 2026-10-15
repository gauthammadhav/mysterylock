/**
 * Types and interfaces for Document Ingestion, Chunking, and Vector Retrieval
 */

export type DocumentProcessingStatus =
  | "uploaded"
  | "extracting"
  | "chunking"
  | "embedding"
  | "indexed"
  | "failed";

export interface DocumentRecord {
  id: string;
  teacher_id: string;
  title: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_path?: string;
  subject?: string;
  status: DocumentProcessingStatus;
  error_message?: string;
  page_count: number;
  total_chunks: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunkRecord {
  id: string;
  document_id: string;
  chunk_index: number;
  page_number: number;
  section_heading?: string;
  content: string;
  content_hash: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface RetrievedPassage {
  id: string;
  document_id: string;
  document_title?: string;
  chunk_index: number;
  page_number: number;
  section_heading?: string;
  content: string;
  relevance_score: number;
}
