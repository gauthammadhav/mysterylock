// Utility for parsing text from uploaded documents (PDF, DOCX, TXT/MD)

// Ensure DOMMatrix and basic canvas globals are polyfilled in Node.js server environments
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;
    inverse() { return this; }
    invertSelf() { return this; }
    multiply() { return this; }
    multiplySelf() { return this; }
    preMultiplySelf() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    transformPoint(p: any) { return p; }
  };
}
if (typeof (globalThis as any).Path2D === "undefined") {
  (globalThis as any).Path2D = class Path2D {
    addPath() {}
    closePath() {}
    moveTo() {}
    lineTo() {}
    bezierCurveTo() {}
    quadraticCurveTo() {}
    arc() {}
    arcTo() {}
    ellipse() {}
    rect() {}
  };
}
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  };
}

export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ text: string; pageCount?: number }> {
  const extension = fileName.split(".").pop()?.toLowerCase();

  // 1. Plain text / Markdown
  if (extension === "txt" || extension === "md" || mimeType.includes("text/")) {
    return { text: fileBuffer.toString("utf-8") };
  }

  // 2. PDF Documents
  if (extension === "pdf" || mimeType === "application/pdf") {
    // Dynamic import to prevent client bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    let pdfParse: any;
    try {
      pdfParse = require("pdf-parse/lib/pdf-parse.js");
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      pdfParse = require("pdf-parse");
    }

    let text = "";
    let pageCount = 1;

    if (typeof pdfParse === "function") {
      const data = await pdfParse(fileBuffer);
      text = data.text || "";
      pageCount = data.numpages || 1;
    } else if (pdfParse?.PDFParse) {
      const parser = new pdfParse.PDFParse({ data: fileBuffer });
      const result = await parser.getText();
      text = result.text || "";
      pageCount = result.total || 1;
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
    } else if (typeof pdfParse?.default === "function") {
      const data = await pdfParse.default(fileBuffer);
      text = data.text || "";
      pageCount = data.numpages || 1;
    }

    return {
      text,
      pageCount,
    };
  }

  // 3. Word DOCX Documents
  if (
    extension === "docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return { text: result.value || "" };
  }

  throw new Error(
    `Unsupported file format: .${extension}. Please upload a PDF, DOCX, or TXT document.`
  );
}

/**
 * Splits document text into clean semantic paragraphs/chunks with overlap.
 */
export function chunkText(
  text: string,
  chunkSize: number = 800,
  overlap: number = 150
): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleaned.length) {
    let endIndex = startIndex + chunkSize;

    // Try to break at a newline or period
    if (endIndex < cleaned.length) {
      const naturalBreak = cleaned.lastIndexOf("\n", endIndex);
      if (naturalBreak > startIndex + chunkSize / 2) {
        endIndex = naturalBreak;
      } else {
        const sentenceBreak = cleaned.lastIndexOf(". ", endIndex);
        if (sentenceBreak > startIndex + chunkSize / 2) {
          endIndex = sentenceBreak + 1;
        }
      }
    }

    const chunk = cleaned.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = endIndex - overlap;
  }

  return chunks;
}
