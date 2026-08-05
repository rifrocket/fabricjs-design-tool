import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rect } from "fabric";
import type { PropertyFieldDefinition } from "@rifrocket/fdt-core";
import { SliderField } from "./SliderField";

describe("SliderField", () => {
  it("uses field.config.min/max/step on the range input, not the generic default", () => {
    const object = new Rect({ opacity: 0.5 });
    const field: PropertyFieldDefinition = { key: "opacity", config: { min: 0, max: 1, step: 0.01 } };
    render(<SliderField object={object} field={field} onChange={vi.fn()} />);

    const range = screen.getByRole("slider") as HTMLInputElement;
    expect(range.min).toBe("0");
    expect(range.max).toBe("1");
    expect(range.step).toBe("0.01");
    expect(range.value).toBe("0.5");
  });

  it("falls back to the generic 0..100 range when no config is provided", () => {
    const object = new Rect({ customProp: 40 } as never);
    const field: PropertyFieldDefinition = { key: "customProp" };
    render(<SliderField object={object} field={field} onChange={vi.fn()} />);

    const range = screen.getByRole("slider") as HTMLInputElement;
    expect(range.min).toBe("0");
    expect(range.max).toBe("100");
  });

  it("clamps and rounds to the configured step before calling onChange", () => {
    const object = new Rect({ opacity: 0.5 });
    const field: PropertyFieldDefinition = { key: "opacity", config: { min: 0, max: 1, step: 0.01 } };
    const onChange = vi.fn();
    render(<SliderField object={object} field={field} onChange={onChange} />);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "1.5" } });

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
