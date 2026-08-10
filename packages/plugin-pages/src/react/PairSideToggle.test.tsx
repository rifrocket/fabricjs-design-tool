import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { PagesProvider } from "./PagesProvider";
import { usePagesContext } from "./usePagesContext";
import { PairSideToggle } from "./PairSideToggle";
import { createEngineFactory, fakeCanvasElementFactory, fakeOffscreenCanvasFactory } from "../testUtils";

function SeedPair({ children }: { children: ReactNode }) {
  const { pages, manager } = usePagesContext();
  if (pages.length === 0) {
    const { front } = manager.addPagePair();
    void manager.setActivePage(front.id);
  }
  return <>{children}</>;
}

function SeedLonePage({ children }: { children: ReactNode }) {
  const { pages, manager } = usePagesContext();
  if (pages.length === 0) {
    const page = manager.addPage();
    void manager.setActivePage(page.id);
  }
  return <>{children}</>;
}

function renderToggle(Seed: typeof SeedPair) {
  return render(
    <PagesProvider
      options={{
        maxPages: 5,
        canvasElementFactory: fakeCanvasElementFactory,
        thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
      }}
      engineFactory={createEngineFactory()}
    >
      <Seed>
        <PairSideToggle />
      </Seed>
    </PagesProvider>,
  );
}

describe("PairSideToggle", () => {
  it("renders null when the active page isn't part of a pair", async () => {
    const { container } = renderToggle(SeedLonePage);
    await waitFor(() => expect(container.querySelector("button")).toBeNull());
  });

  it("switches the active page to its sibling on click", async () => {
    renderToggle(SeedPair);
    await waitFor(() => expect(screen.getByTitle(/Switch to back/)).toBeTruthy());

    fireEvent.click(screen.getByTitle(/Switch to back/));

    await waitFor(() => expect(screen.getByTitle(/Switch to front/)).toBeTruthy());
  });
});
