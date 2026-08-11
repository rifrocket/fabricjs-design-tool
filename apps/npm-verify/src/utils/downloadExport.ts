export interface DownloadableExport {
  fileName: string;
  mimeType: string;
  data: string | Blob;
}

export function downloadExport(result: DownloadableExport): void {
  if (typeof result.data === "string" && result.data.startsWith("data:")) {
    const a = document.createElement("a");
    a.href = result.data;
    a.download = result.fileName;
    a.click();
    return;
  }

  const blob = result.data instanceof Blob ? result.data : new Blob([result.data], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
