import type { Canvas } from "fabric";
import jsPDF from "jspdf";

export interface PdfExportResult {
  format: "pdf";
  fileName: string;
  mimeType: string;
  data: Blob;
}

const PDF_PAGE_WIDTH_MM = 210;
const PDF_PAGE_HEIGHT_MM = 297;
const PDF_MARGIN_MM = 10;

// Moved out of @rifrocket/fabricjs-design-tool verbatim: jsPDF pulled in ~230KB of transitive deps as a
// hard dependency of every core consumer, for a format most editors never use.
export function exportPdf(canvas: Canvas): PdfExportResult {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const imageData = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });

  const canvasRatio = canvasWidth / canvasHeight;
  const pageRatio = PDF_PAGE_WIDTH_MM / PDF_PAGE_HEIGHT_MM;

  let imgWidth: number;
  let imgHeight: number;
  let x: number;
  let y: number;

  if (canvasRatio > pageRatio) {
    imgWidth = PDF_PAGE_WIDTH_MM - PDF_MARGIN_MM * 2;
    imgHeight = imgWidth / canvasRatio;
    x = PDF_MARGIN_MM;
    y = (PDF_PAGE_HEIGHT_MM - imgHeight) / 2;
  } else {
    imgHeight = PDF_PAGE_HEIGHT_MM - PDF_MARGIN_MM * 2;
    imgWidth = imgHeight * canvasRatio;
    x = (PDF_PAGE_WIDTH_MM - imgWidth) / 2;
    y = PDF_MARGIN_MM;
  }

  const pdf = new jsPDF({
    orientation: canvasRatio > 1 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });
  pdf.addImage(imageData, "PNG", x, y, imgWidth, imgHeight);

  return {
    format: "pdf",
    fileName: `canvas-export-${Date.now()}.pdf`,
    mimeType: "application/pdf",
    data: pdf.output("blob"),
  };
}
