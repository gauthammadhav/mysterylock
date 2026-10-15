import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchDocumentChunks } from "@/lib/retrieval/vector-search";
import { extractEducationalFacts } from "@/lib/education/fact-extraction";
import { RetrievedPassage, DocumentChunkRecord } from "@/types/rag";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in as a teacher." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assignmentId, documentId, subject, learningObjectives } = body;

    if (!assignmentId || !learningObjectives || !Array.isArray(learningObjectives) || learningObjectives.length === 0) {
      return NextResponse.json(
        { error: "assignmentId and an array of learningObjectives are required." },
        { status: 400 }
      );
    }

    // 1. Fetch document chunks
    let chunksQuery = supabase
      .from("document_chunks")
      .select("id, document_id, chunk_index, page_number, section_heading, content, content_hash, embedding");

    if (documentId) {
      chunksQuery = chunksQuery.eq("document_id", documentId);
    } else {
      // Find latest document for this teacher
      const { data: latestDoc } = await supabase
        .from("documents")
        .select("id")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latestDoc?.id) {
        chunksQuery = chunksQuery.eq("document_id", latestDoc.id);
      }
    }

    const { data: rawChunks } = await chunksQuery.limit(50);
    const chunks: DocumentChunkRecord[] = (rawChunks || []).map((c: any) => ({
      id: c.id,
      document_id: c.document_id,
      chunk_index: c.chunk_index,
      page_number: c.page_number || 1,
      section_heading: c.section_heading,
      content: c.content,
      content_hash: c.content_hash,
      embedding: c.embedding,
    }));

    // 2. Perform objective-oriented retrieval for each learning objective
    const relevantPassages: RetrievedPassage[] = [];
    const seenChunkIds = new Set<string>();

    for (const obj of learningObjectives) {
      const topMatches = await searchDocumentChunks(obj, chunks, {
        topK: 3,
        similarityThreshold: 0.2,
      });

      for (const match of topMatches) {
        if (!seenChunkIds.has(match.id)) {
          seenChunkIds.add(match.id);
          relevantPassages.push(match);
        }
      }
    }

    // If retrieval found few passages, include general chunks
    if (relevantPassages.length < 3 && chunks.length > 0) {
      for (const c of chunks.slice(0, 5)) {
        if (!seenChunkIds.has(c.id)) {
          seenChunkIds.add(c.id);
          relevantPassages.push({
            id: c.id,
            document_id: c.document_id,
            chunk_index: c.chunk_index,
            page_number: c.page_number,
            section_heading: c.section_heading,
            content: c.content,
            relevance_score: 0.5,
          });
        }
      }
    }

    // 3. Extract educational facts grounded in the retrieved passages
    const extractionResult = await extractEducationalFacts({
      subject: subject || "General Coursework",
      learningObjectives,
      passages: relevantPassages,
    });

    // 4. Save extracted facts in extracted_facts table
    if (extractionResult.facts.length > 0) {
      const factsToInsert = extractionResult.facts.map((f) => ({
        id: f.id,
        assignment_id: assignmentId,
        document_id: documentId || null,
        statement: f.statement,
        fact_type: f.fact_type,
        concept_category: f.concept_category,
        source_chunk_ids: f.source_chunk_ids,
        page_or_section: f.page_or_section,
        learning_objective: f.learning_objective,
        prerequisites: f.prerequisites,
        potential_misconceptions: f.potential_misconceptions,
        suggested_difficulty: f.suggested_difficulty,
        assessment_opportunities: f.assessment_opportunities,
        is_approved: true,
        is_selected: true,
      }));

      // Delete older facts for this assignment if re-extracting
      await supabase.from("extracted_facts").delete().eq("assignment_id", assignmentId);

      const { error: insertErr } = await supabase
        .from("extracted_facts")
        .insert(factsToInsert);

      if (insertErr) {
        console.warn("Extracted facts insert warning:", insertErr);
      }
    }

    return NextResponse.json({
      success: true,
      facts: extractionResult.facts,
      coverageSummary: extractionResult.coverage_summary,
      retrievedPassageCount: relevantPassages.length,
    });
  } catch (error: any) {
    console.error("Fact extraction API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to extract candidate facts." },
      { status: 500 }
    );
  }
}
