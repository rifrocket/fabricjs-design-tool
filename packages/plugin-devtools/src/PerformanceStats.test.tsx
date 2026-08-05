import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Store } from "@rifrocket/fdt-core";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import { EditorContext } from "@rifrocket/fdt-react";
import { PerformanceStats } from "./PerformanceStats";

describe("PerformanceStats", () => {
  it("renders an initial FPS of 0 and the current object count, without starting the rAF loop when inactive", () => {
    const store = new Store({ objectIds: ["a", "b", "c"] });
    const engine = { store } as unknown as CanvasEngine;

    render(
      <EditorContext.Provider value={engine}>
        <PerformanceStats active={false} />
      </EditorContext.Provider>,
    );

    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });
});
