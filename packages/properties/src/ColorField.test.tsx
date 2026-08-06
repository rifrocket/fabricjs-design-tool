import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rect } from "fabric";
import type { PropertyFieldDefinition } from "@rifrocket/fabricjs-design-tool";
import { ColorField } from "./ColorField";

describe("ColorField", () => {
  it("reads the current hex value", () => {
    const object = new Rect({ fill: "#ff0000" });
    const field: PropertyFieldDefinition = { key: "fill" };
    render(<ColorField object={object} field={field} onChange={vi.fn()} />);

    expect((screen.getByLabelText("fill") as HTMLInputElement).value).toBe("#ff0000");
  });

  it("falls back to a neutral default for a non-hex fill (e.g. a gradient)", () => {
    const object = new Rect({ fill: "some-gradient-object" as unknown as string });
    const field: PropertyFieldDefinition = { key: "fill" };
    render(<ColorField object={object} field={field} onChange={vi.fn()} />);

    expect((screen.getByLabelText("fill") as HTMLInputElement).value).toBe("#000000");
  });

  it("calls onChange with the picked color", () => {
    const object = new Rect({ fill: "#ff0000" });
    const field: PropertyFieldDefinition = { key: "fill" };
    const onChange = vi.fn();
    render(<ColorField object={object} field={field} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("fill"), { target: { value: "#00ff00" } });

    expect(onChange).toHaveBeenCalledWith("#00ff00");
  });
});
