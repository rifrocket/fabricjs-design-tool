import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rect } from "fabric";
import type { PropertyFieldDefinition } from "@rifrocket/fdt-core";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("reads the current string value and calls onChange as the user types", () => {
    const object = new Rect({ text: "Hello" } as never);
    const field: PropertyFieldDefinition = { key: "text" };
    const onChange = vi.fn();
    render(<TextField object={object} field={field} onChange={onChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("Hello");

    fireEvent.change(input, { target: { value: "World" } });
    expect(onChange).toHaveBeenCalledWith("World");
  });
});
