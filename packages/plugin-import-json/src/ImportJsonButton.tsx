import { useRef } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { useEditor } from "@rifrocket/fdt-react";

// Bare/unstyled, matching the convention @rifrocket/fdt-react's own shipped components
// already follow — consumers wanting a polished button build their own the same way.
export function ImportJsonButton(): ReactElement {
  const engine = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    await engine.importFile("json", JSON.parse(text));
  };

  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Import JSON
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={(event) => void handleChange(event)}
      />
    </>
  );
}
