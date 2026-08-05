import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rect } from "fabric";
import type { PropertyFieldDefinition } from "@rifrocket/fabricjs-design-tool";
import { ToggleField } from "./ToggleField";

describe("ToggleField", () => {
  it("defaults to a real boolean on/off pair when no config.options is given", () => {
    const object = new Rect({ visible: true } as never);
    const field: PropertyFieldDefinition = { key: "visible" };
    const onChange = vi.fn();
    render(<ToggleField object={object} field={field} onChange={onChange} />);

    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("treats a 2-entry config.options array as [onValue, offValue]", () => {
    const object = new Rect({ fontWeight: "bold" } as never);
    const field: PropertyFieldDefinition = {
      key: "fontWeight",
      config: { options: [{ label: "Bold", value: "bold" }, { label: "Normal", value: "normal" }] },
    };
    const onChange = vi.fn();
    render(<ToggleField object={object} field={field} onChange={onChange} />);

    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith("normal");
  });
});
