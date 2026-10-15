import crypto from "crypto";

export interface SemanticChunk {
  chunk_index: number;
  page_number: number;
  section_heading: string;
  content: string;
  content_hash: string;
}

/**
 * Splits document text into section-aware, overlapping semantic chunks.
 * Preserves headings and page boundaries where present.
 */
export function createSemanticChunks(
  text: string,
  chunkSize: number = 750,
  overlap: number = 120
): SemanticChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  // Split into paragraphs / sections
  const rawParagraphs = normalized.split(/\n\s*\n/);
  const chunks: SemanticChunk[] = [];

  let currentHeading = "General Content";
  let currentPage = 1;
  let accumulatedText = "";
  let chunkIndex = 0;

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Detect page markers like --- Page 2 --- or [Page 2]
    const pageMatch = trimmed.match(/(?:page|\bpg\b)\s*[:#\-]?\s*(\d+)/i);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10) || currentPage;
    }

    // Detect possible section headings (short lines without terminal periods or markdown headers)
    if (
      (trimmed.startsWith("#") ||
        (trimmed.length < 80 && !trimmed.endsWith(".") && trimmed.split("\n").length === 1)) &&
      !pageMatch
    ) {
      currentHeading = trimmed.replace(/^[#\s]+/, "");
    }

    // If adding this paragraph exceeds chunkSize, flush current chunk
    if (accumulatedText.length + trimmed.length > chunkSize && accumulatedText.length > 0) {
      const hash = crypto.createHash("sha256").update(accumulatedText).digest("hex");
      chunks.push({
        chunk_index: chunkIndex++,
        page_number: currentPage,
        section_heading: currentHeading,
        content: accumulatedText,
        content_hash: hash,
      });

      // Keep overlapping suffix
      const words = accumulatedText.split(" ");
      const overlapWordCount = Math.min(Math.floor(overlap / 6), words.length);
      const overlapText = words.slice(-overlapWordCount).join(" ");
      accumulatedText = overlapText + (overlapText ? "\n\n" : "") + trimmed;
    } else {
      accumulatedText = accumulatedText
        ? `${accumulatedText}\n\n${trimmed}`
        : trimmed;
    }
  }

  // Flush remaining text
  if (accumulatedText.trim().length > 0) {
    const hash = crypto.createHash("sha256").update(accumulatedText).digest("hex");
    chunks.push({
      chunk_index: chunkIndex,
      page_number: currentPage,
      section_heading: currentHeading,
      content: accumulatedText.trim(),
      content_hash: hash,
    });
  }

  return chunks;
}
