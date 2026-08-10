import type { Canvas } from "fabric";
import jsPDF from "jspdf";

export interface PdfExportResult {
  format: "pdf";
  fileName: string;
  mimeType: string;
  data: Blob;
}

export interface PdfExportOptions {
  /**
   * Defaults to "a4". Anything jsPDF's own `format` option accepts (e.g. "letter", "legal"),
   * a literal `{ widthMm, heightMm }` for a manually-specified physical size, or "match-canvas"
   * to derive the page size directly from the canvas's own pixel dimensions and `dpi` — the page
   * *is* the design's physical size (e.g. an exact 89mm×51mm business card) instead of the
   * design being fitted with whitespace onto a fixed paper sheet. Print-ready output is
   * `"match-canvas"` combined with `marginMm: 0`.
   */
  pageSize?: "a4" | "letter" | "legal" | "match-canvas" | { widthMm: number; heightMm: number };
  /** Only consulted for `pageSize: "match-canvas"`. Defaults to 96 (web px) — pass e.g. 300 for print-grade output. */
  dpi?: number;
  /**
   * Defaults to "auto": landscape for a wider-than-tall canvas, portrait otherwise. With
   * `pageSize: "match-canvas"`, forcing an explicit orientation that conflicts with the canvas's
   * own aspect ratio makes jsPDF swap the resolved width/height to honor it — defeating "the page
   * is the design's exact physical size". Leave this at "auto" (the default) when the physical
   * size itself matters.
   */
  orientation?: "portrait" | "landscape" | "auto";
  /** Defaults to 10mm. Empty space kept around the fitted image on every side of the page. */
  marginMm?: number;
}

const DEFAULT_PAGE_SIZE = "a4" as const;
const DEFAULT_MARGIN_MM = 10;
const DEFAULT_DPI = 96;
const MM_PER_INCH = 25.4;

function pxToMm(px: number, dpi: number): number {
  return (px / dpi) * MM_PER_INCH;
}

// Resolves options.pageSize into whatever jsPDF's own `format` constructor option accepts — a
// string, or a [widthMm, heightMm] array (jsPDF supports a 2-element array directly when `unit`
// is set). Kept separate from the fit-math below so exportPdfMultiPage() can share it.
function resolvePageFormat(canvas: Canvas, options: PdfExportOptions): string | [number, number] {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  if (pageSize === "match-canvas") {
    const dpi = options.dpi ?? DEFAULT_DPI;
    return [pxToMm(canvas.getWidth(), dpi), pxToMm(canvas.getHeight(), dpi)];
  }
  if (typeof pageSize === "object") {
    return [pageSize.widthMm, pageSize.heightMm];
  }
  return pageSize;
}

function resolveOrientation(canvasRatio: number, orientation: PdfExportOptions["orientation"]): "portrait" | "landscape" {
  if (orientation === undefined || orientation === "auto") {
    return canvasRatio > 1 ? "landscape" : "portrait";
  }
  return orientation;
}

// Fits `canvas`'s current content within `pdf`'s current page, preserving aspect ratio, and
// draws it — one page's worth of work, shared by exportPdf() (one page) and
// exportPdfMultiPage() (one call per page).
function drawCanvasOntoPage(pdf: jsPDF, canvas: Canvas, marginMm: number): void {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const imageData = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
  const canvasRatio = canvasWidth / canvasHeight;

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
}

// Moved out of @rifrocket/fabricjs-design-tool verbatim: jsPDF pulled in ~230KB of transitive deps as a
// hard dependency of every core consumer, for a format most editors never use.
export function exportPdf(canvas: Canvas, options: PdfExportOptions = {}): PdfExportResult {
  const canvasRatio = canvas.getWidth() / canvas.getHeight();
  const orientation = resolveOrientation(canvasRatio, options.orientation);
  const marginMm = options.marginMm ?? DEFAULT_MARGIN_MM;

  // Constructed before the fit math (rather than a hardcoded mm lookup table per page size) so
  // the actual page dimensions always come from jsPDF's own format/orientation resolution — one
  // less place for "letter" vs "a4" mm values to drift out of sync with jsPDF.
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: resolvePageFormat(canvas, options),
  });
  drawCanvasOntoPage(pdf, canvas, marginMm);

  return {
    format: "pdf",
    fileName: `canvas-export-${Date.now()}.pdf`,
    mimeType: "application/pdf",
    data: pdf.output("blob"),
  };
}

// One PDF, one page per canvas (e.g. a pair's front canvas then its back canvas), via
// pdf.addPage() between each — for exporting a two-sided document as a single print-ready file.
// Page format/orientation is resolved once, from the *first* canvas, and reused for every page:
// correct for a page pair, whose two sides share identical dimensions by construction (see
// @rifrocket/fdt-plugin-pages' addPagePair()). Not an EditorPlugin — like exportPdf() itself,
// this is a plain function a consumer calls directly; it operates across multiple canvases/
// engines, the same category of concern @rifrocket/fdt-plugin-pages is, so this package stays
// free of any dependency on it (the same cross-plugin-dependency boundary
// captureSnapshotExcludingBoundary establishes for @rifrocket/fdt-plugin-pan-zoom).
export function exportPdfMultiPage(canvases: Canvas[], options: PdfExportOptions = {}): PdfExportResult {
  if (canvases.length === 0) {
    throw new Error("exportPdfMultiPage() needs at least one canvas");
  }

  const [firstCanvas] = canvases;
  const canvasRatio = firstCanvas.getWidth() / firstCanvas.getHeight();
  const orientation = resolveOrientation(canvasRatio, options.orientation);
  const marginMm = options.marginMm ?? DEFAULT_MARGIN_MM;

  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: resolvePageFormat(firstCanvas, options),
  });

  canvases.forEach((canvas, index) => {
    if (index > 0) pdf.addPage();
    drawCanvasOntoPage(pdf, canvas, marginMm);
  });

  return {
    format: "pdf",
    fileName: `canvas-export-${Date.now()}.pdf`,
    mimeType: "application/pdf",
    data: pdf.output("blob"),
  };
}
