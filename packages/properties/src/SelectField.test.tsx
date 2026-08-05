import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rect } from "fabric";
import type { PropertyFieldDefinition } from "@rifrocket/fdt-core";
import { SelectField } from "./SelectField";

describe("SelectField", () => {
  it("renders one <option> per field.config.options entry, and selects the object's current value", () => {
    const object = new Rect({ textAlign: "center" } as never);
    const field: PropertyFieldDefinition = {
      key: "textAlign",
      config: {
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    };
    render(<SelectField object={object} field={field} onChange={vi.fn()} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("center");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onChange with the original option value, not just the stringified DOM value", () => {
    const object = new Rect({ textAlign: "left" } as never);
    const field: PropertyFieldDefinition = {
      key: "textAlign",
      config: {
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
    };
    const onChange = vi.fn();
    render(<SelectField object={object} field={field} onChange={onChange} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "right" } });

    expect(onChange).toHaveBeenCalledWith("right");
  });
});
