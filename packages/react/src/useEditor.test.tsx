import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEditor } from "./useEditor";

describe("useEditor", () => {
  it("throws when called outside an <Editor> provider", () => {
    expect(() => renderHook(() => useEditor())).toThrow(
      "useEditor() must be called within an <Editor> whose engine has finished initializing",
    );
  });
});
