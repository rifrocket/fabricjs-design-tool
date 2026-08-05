import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useFocusTrap } from "./useFocusTrap";

function TrapHarness({ active, onEscape }: { active: boolean; onEscape?: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>({ active, onEscape });
  return (
    <div>
      <button>Outside</button>
      <div ref={ref} data-testid="trap">
        <button>First</button>
        <button>Last</button>
      </div>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("focuses the first focusable element when activated", () => {
    render(<TrapHarness active />);
    expect(document.activeElement).toBe(screen.getByText("First"));
  });

  it("wraps focus from the last element back to the first on Tab", () => {
    render(<TrapHarness active />);
    screen.getByText("Last").focus();

    fireEvent.keyDown(screen.getByTestId("trap"), { key: "Tab" });

    expect(document.activeElement).toBe(screen.getByText("First"));
  });

  it("wraps focus from the first element to the last on Shift+Tab", () => {
    render(<TrapHarness active />);
    screen.getByText("First").focus();

    fireEvent.keyDown(screen.getByTestId("trap"), { key: "Tab", shiftKey: true });

    expect(document.activeElement).toBe(screen.getByText("Last"));
  });

  it("does not wrap focus when Tab is pressed away from either edge", () => {
    render(
      <div>
        <button>Outside</button>
        <TrapHarnessWithThreeButtons />
      </div>,
    );
    const middle = screen.getByText("Middle");
    middle.focus();

    fireEvent.keyDown(screen.getByTestId("trap"), { key: "Tab" });

    expect(document.activeElement).toBe(middle);
  });

  it("calls onEscape when Escape is pressed", () => {
    const onEscape = vi.fn();
    render(<TrapHarness active onEscape={onEscape} />);

    fireEvent.keyDown(screen.getByTestId("trap"), { key: "Escape" });

    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("restores focus to the previously focused element once deactivated", () => {
    function Wrapper({ active }: { active: boolean }) {
      return (
        <div>
          <button>Trigger</button>
          <TrapHarness active={active} />
        </div>
      );
    }

    const { rerender } = render(<Wrapper active={false} />);
    screen.getByText("Trigger").focus();

    rerender(<Wrapper active />);
    expect(document.activeElement).toBe(screen.getByText("First"));

    rerender(<Wrapper active={false} />);
    expect(document.activeElement).toBe(screen.getByText("Trigger"));
  });
});

function TrapHarnessWithThreeButtons() {
  const ref = useFocusTrap<HTMLDivElement>({ active: true });
  return (
    <div ref={ref} data-testid="trap">
      <button>First</button>
      <button>Middle</button>
      <button>Last</button>
    </div>
  );
}
