import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, chunkText } from "@/lib/documents/parser";
import { extractLearningObjectivesFromText } from "@/lib/ai/objectiveExtractor";

export const maxDuration = 60; // Allow sufficient time for document parsing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subject = (formData.get("subject") as string) || "General Coursework";

    if (!file) {
      return NextResponse.json(
        { error: "No document file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Parse text from uploaded PDF / DOCX / TXT
    const { text, pageCount } = await extractTextFromFile(
      buffer,
      file.name,
      file.type
    );

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract sufficient text from the file. Please ensure it contains readable text.",
        },
        { status: 400 }
      );
    }

    // 2. Split into semantic chunks for vector grounding
    const chunks = chunkText(text);

    // 3. Extract candidate Learning Objectives mapped to Bloom's taxonomy
    const learningObjectives = await extractLearningObjectivesFromText(
      text,
      subject
    );

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      pageCount: pageCount || 1,
      totalChunks: chunks.length,
      extractedTextLength: text.length,
      previewExcerpt: text.slice(0, 400) + (text.length > 400 ? "..." : ""),
      learningObjectives,
    });
  } catch (error: any) {
    console.error("Document parsing error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to parse document. Please check the file format.",
      },
      { status: 500 }
    );
  }
}
