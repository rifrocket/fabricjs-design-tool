import { useRef } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { ImagePlus } from "lucide-react";
import { useEditor } from "@rifrocket/fdt-react";

const ICON_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-lg text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Uses the "image" object type registered by @rifrocket/fdt-plugin-image — there is no
// built-in image type in @rifrocket/fdt-core itself, so this exercises the same extension
// point any consumer would use to add a new kind of object.
export function ImageUploadButton(): ReactElement {
  const engine = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    await engine.addObjectOfType("image", { src: dataUrl });
  };

  return (
    <>
      <button
        type="button"
        title="Upload image"
        onClick={() => inputRef.current?.click()}
        className={ICON_BUTTON_CLASS}
      >
        <ImagePlus size={17} strokeWidth={1.75} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleChange(e)} />
    </>
  );
}
