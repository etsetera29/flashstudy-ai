// lib/parseFile.ts
// Runs entirely in the browser - no file is uploaded to a server

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 14000;

export async function parseFile(file: File): Promise<string> {
  // Validate file type
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowedExtensions = [".pdf", ".docx"];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`
    );
  }

  let text = "";

  if (fileExtension === ".pdf" || file.type === "application/pdf") {
    text = await parsePDF(file);
  } else if (
    fileExtension === ".docx" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = await parseDOCX(file);
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
  }

  // Clean and normalize text
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (!text || text.length < 100) {
    throw new Error(
      "Could not extract enough text from this file. The file may be scanned, image-based, or empty."
    );
  }

  // Truncate to safe limit for API
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH);
    // Trim to the last complete sentence to avoid cutting mid-sentence
    const lastPeriod = text.lastIndexOf(".");
    if (lastPeriod > MAX_TEXT_LENGTH * 0.85) {
      text = text.slice(0, lastPeriod + 1);
    }
  }

  return text;
}

async function parsePDF(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import("pdfjs-dist");

    // Set worker source - required for pdfjs-dist
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const textParts: string[] = [];
    const maxPages = Math.min(pdf.numPages, 50); // Cap at 50 pages

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      textParts.push(pageText);

      // Early exit if we already have enough text
      if (textParts.join("\n").length > MAX_TEXT_LENGTH * 1.5) {
        break;
      }
    }

    return textParts.join("\n");
  } catch (error) {
    throw new Error(
      "Failed to parse PDF. The file may be corrupted, password-protected, or scanned."
    );
  }
}

async function parseDOCX(file: File): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
      console.warn("DOCX parse warnings:", result.messages);
    }

    return result.value;
  } catch (error) {
    throw new Error(
      "Failed to parse DOCX. The file may be corrupted or in an unsupported format."
    );
  }
}
