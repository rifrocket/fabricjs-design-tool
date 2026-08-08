import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { PagesProvider } from "./PagesProvider";
import { usePagesContext } from "./usePagesContext";
import { PageTabsBar } from "./PageTabsBar";
import { createEngineFactory, fakeCanvasElementFactory, fakeOffscreenCanvasFactory } from "../testUtils";

function Seed({ children }: { children: ReactNode }) {
  const { pages, manager } = usePagesContext();
  if (pages.length === 0) {
    const page = manager.addPage({ name: "Page 1" });
    void manager.setActivePage(page.id);
  }
  return <>{children}</>;
}

function renderTabsBar(maxPages: number) {
  return render(
    <PagesProvider
      options={{
        maxPages,
        canvasElementFactory: fakeCanvasElementFactory,
        thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
      }}
      engineFactory={createEngineFactory()}
    >
      <Seed>
        <PageTabsBar />
      </Seed>
    </PagesProvider>,
  );
}

describe("PageTabsBar", () => {
  it("renders a tab for each page", async () => {
    renderTabsBar(5);
    await waitFor(() => expect(screen.getByTitle("Add page")).toBeTruthy());
    expect(screen.getByText("Page 1")).toBeTruthy();
  });

  it("adds a page when 'Add page' is clicked", async () => {
    renderTabsBar(5);
    await waitFor(() => expect(screen.getByTitle("Add page")).toBeTruthy());

    fireEvent.click(screen.getByTitle("Add page"));

    await waitFor(() => expect(screen.getByText("Page 2")).toBeTruthy());
  });

  it("disables 'Add page' at manager.getMaxPages(), not a hardcoded constant", async () => {
    renderTabsBar(1);
    await waitFor(() => expect(screen.getByTitle(/Maximum of 1 pages reached/)).toBeTruthy());
    const addButton = screen.getByTitle(/Maximum of 1 pages reached/) as HTMLButtonElement;
    expect(addButton.disabled).toBe(true);
  });

  it("disables delete for the last remaining page", async () => {
    renderTabsBar(5);
    await waitFor(() => expect(screen.getByTitle("Cannot delete the last page")).toBeTruthy());
    const deleteButton = screen.getByTitle("Cannot delete the last page") as HTMLButtonElement;
    expect(deleteButton.disabled).toBe(true);
  });
});
