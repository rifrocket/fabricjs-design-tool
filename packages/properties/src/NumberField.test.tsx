import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rect } from "fabric";
import type { PropertyFieldDefinition } from "@rifrocket/fdt-core";
import { NumberField } from "./NumberField";

describe("NumberField", () => {
  it("reads the current value and uses field.config.step, defaulting to 1", () => {
    const object = new Rect({ left: 42 });
    const field: PropertyFieldDefinition = { key: "left" };
    render(<NumberField object={object} field={field} onChange={vi.fn()} />);

    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("42");
    expect(input.step).toBe("1");
  });

  it("rounds to the configured step and commits on blur", () => {
    const object = new Rect({ left: 0 });
    const field: PropertyFieldDefinition = { key: "left", config: { step: 5 } };
    const onChange = vi.fn();
    render(<NumberField object={object} field={field} onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(10);
  });
});
