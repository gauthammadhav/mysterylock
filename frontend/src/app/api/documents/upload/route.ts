import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromFile } from "@/lib/documents/parser";
import { createSemanticChunks } from "@/lib/documents/chunker";
import { generateBatchEmbeddings } from "@/lib/embeddings/provider";
import { extractLearningObjectivesFromText } from "@/lib/ai/objectiveExtractor";

export const maxDuration = 60;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt", "md"];

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subject = (formData.get("subject") as string) || "General Coursework";
    const title = (formData.get("title") as string) || file?.name || "Uploaded Course Document";

    if (!file) {
      return NextResponse.json(
        { error: "No document file was uploaded." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 25MB limit. Please upload a smaller document." },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported file format (.${extension}). Supported: PDF, DOCX, TXT.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Create document record in database
    const { data: documentRecord, error: docInsertErr } = await supabase
      .from("documents")
      .insert({
        teacher_id: user.id,
        title: title.trim(),
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
        subject: subject.trim(),
        status: "extracting",
        metadata: { originalName: file.name, uploadedAt: new Date().toISOString() },
      })
      .select()
      .single();

    if (docInsertErr) {
      console.error("Error creating document record:", docInsertErr);
      return NextResponse.json(
        { error: docInsertErr.message || "Failed to initialize document record." },
        { status: 500 }
      );
    }

    const docId = documentRecord.id;

    // 2. Extract readable text
    let extractedText = "";
    let pageCount = 1;

    try {
      const extraction = await extractTextFromFile(buffer, file.name, file.type);
      extractedText = extraction.text;
      pageCount = extraction.pageCount || 1;
    } catch (parseErr: any) {
      await supabase
        .from("documents")
        .update({ status: "failed", error_message: parseErr.message })
        .eq("id", docId);

      return NextResponse.json(
        { error: parseErr.message || "Text extraction failed. Ensure document is not an image-only scan." },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 50) {
      await supabase
        .from("documents")
        .update({ status: "failed", error_message: "Document contains insufficient readable text." })
        .eq("id", docId);

      return NextResponse.json(
        { error: "Could not extract sufficient text. Scanned PDFs require optical character recognition (OCR)." },
        { status: 400 }
      );
    }

    // 3. Section-aware semantic chunking
    await supabase.from("documents").update({ status: "chunking" }).eq("id", docId);
    const semanticChunks = createSemanticChunks(extractedText, 800, 150);

    // 4. Batch embeddings generation
    await supabase.from("documents").update({ status: "embedding" }).eq("id", docId);
    const chunkTexts = semanticChunks.map((c) => c.content);
    const embeddings = await generateBatchEmbeddings(chunkTexts);

    // 5. Store chunks in database
    const chunksToInsert = semanticChunks.map((c, i) => ({
      document_id: docId,
      chunk_index: c.chunk_index,
      page_number: c.page_number,
      section_heading: c.section_heading,
      content: c.content,
      content_hash: c.content_hash,
      embedding: embeddings[i],
    }));

    const { error: chunkInsertErr } = await supabase
      .from("document_chunks")
      .insert(chunksToInsert);

    if (chunkInsertErr) {
      console.warn("Chunk insert warning (retrying):", chunkInsertErr);
    }

    // 6. Update document status to indexed
    await supabase
      .from("documents")
      .update({
        status: "indexed",
        page_count: pageCount,
        total_chunks: semanticChunks.length,
      })
      .eq("id", docId);

    // 7. Extract candidate learning objectives mapped to Bloom's taxonomy
    const learningObjectives = await extractLearningObjectivesFromText(
      extractedText,
      subject
    );

    return NextResponse.json({
      success: true,
      documentId: docId,
      fileName: file.name,
      fileSize: file.size,
      pageCount,
      totalChunks: semanticChunks.length,
      extractedTextLength: extractedText.length,
      previewExcerpt: extractedText.slice(0, 450) + (extractedText.length > 450 ? "..." : ""),
      learningObjectives,
    });
  } catch (error: any) {
    console.error("Document upload pipeline error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process document upload." },
      { status: 500 }
    );
  }
}
