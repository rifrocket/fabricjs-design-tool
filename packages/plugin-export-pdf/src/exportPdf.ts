import type { Canvas } from "fabric";
import jsPDF from "jspdf";

export interface PdfExportResult {
  format: "pdf";
  fileName: string;
  mimeType: string;
  data: Blob;
}

export interface PdfExportOptions {
  /** Defaults to "a4". Anything jsPDF's own `format` option accepts (e.g. "letter", "legal"). */
  pageSize?: "a4" | "letter" | "legal";
  /** Defaults to "auto": landscape for a wider-than-tall canvas, portrait otherwise. */
  orientation?: "portrait" | "landscape" | "auto";
  /** Defaults to 10mm. Empty space kept around the fitted image on every side of the page. */
  marginMm?: number;
}

const DEFAULT_PAGE_SIZE: NonNullable<PdfExportOptions["pageSize"]> = "a4";
const DEFAULT_MARGIN_MM = 10;

// Moved out of @rifrocket/fabricjs-design-tool verbatim: jsPDF pulled in ~230KB of transitive deps as a
// hard dependency of every core consumer, for a format most editors never use.
export function exportPdf(canvas: Canvas, options: PdfExportOptions = {}): PdfExportResult {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const imageData = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });

  const canvasRatio = canvasWidth / canvasHeight;
  const orientation =
    options.orientation === undefined || options.orientation === "auto"
      ? canvasRatio > 1
        ? "landscape"
        : "portrait"
      : options.orientation;
  const marginMm = options.marginMm ?? DEFAULT_MARGIN_MM;

  // Constructed before the fit math below (rather than a hardcoded mm lookup table per page
  // size) so the actual page dimensions always come from jsPDF's own format/orientation
  // resolution — one less place for "letter" vs "a4" mm values to drift out of sync with jsPDF.
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: options.pageSize ?? DEFAULT_PAGE_SIZE,
  });
  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const pageRatio = pageWidthMm / pageHeightMm;

  let imgWidth: number;
  let imgHeight: number;
  let x: number;
  let y: number;

  if (canvasRatio > pageRatio) {
    imgWidth = pageWidthMm - marginMm * 2;
    imgHeight = imgWidth / canvasRatio;
    x = marginMm;
    y = (pageHeightMm - imgHeight) / 2;
  } else {
    imgHeight = pageHeightMm - marginMm * 2;
    imgWidth = imgHeight * canvasRatio;
    x = (pageWidthMm - imgWidth) / 2;
    y = marginMm;
  }

  pdf.addImage(imageData, "PNG", x, y, imgWidth, imgHeight);

  return {
    format: "pdf",
    fileName: `canvas-export-${Date.now()}.pdf`,
    mimeType: "application/pdf",
    data: pdf.output("blob"),
  };
}
