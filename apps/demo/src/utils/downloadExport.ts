import type { ExportResult } from "@rifrocket/fdt-core";

// CanvasExporter's `data` isn't one shape across formats: PNG/JPEG are data: URLs, PDF is a
// Blob, but JSON/SVG are raw text — treating raw text as an href (the previous bug) produced a
// malformed relative URL that 404'd and fell back to index.html, downloading an HTML page instead of the design.
function toDownloadUrl(result: ExportResult): { url: string; revoke: boolean } {
  if (result.data instanceof Blob) {
    return { url: URL.createObjectURL(result.data), revoke: true };
  }
  if (result.data.startsWith("data:")) {
    return { url: result.data, revoke: false };
  }
  const blob = new Blob([result.data], { type: result.mimeType });
  return { url: URL.createObjectURL(blob), revoke: true };
}

// Triggering a browser download from CanvasExporter's output is a UI concern, not core's —
// this is the demo's implementation of that step.
export function downloadExport(result: ExportResult): void {
  const { url, revoke } = toDownloadUrl(result);
  const link = document.createElement("a");
  link.href = url;
  link.download = result.fileName;
  link.click();
  if (revoke) {
    URL.revokeObjectURL(url);
  }
}
