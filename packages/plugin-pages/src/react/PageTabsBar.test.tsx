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

  it("disables 'Add page pair' when fewer than 2 slots remain", async () => {
    renderTabsBar(2);
    await waitFor(() => expect(screen.getByTitle(/1 of 2 page slots remain/)).toBeTruthy());
    const addPairButton = screen.getByTitle(/1 of 2 page slots remain/) as HTMLButtonElement;
    expect(addPairButton.disabled).toBe(true);
  });

  it("clicking 'Add page pair' adds two linked pages", async () => {
    renderTabsBar(5);
    await waitFor(() => expect(screen.getByTitle("Add page pair (front + back)")).toBeTruthy());

    fireEvent.click(screen.getByTitle("Add page pair (front + back)"));

    await waitFor(() => expect(screen.getByTitle(/pair \(front\)/)).toBeTruthy());
    expect(screen.getByTitle(/pair \(back\)/)).toBeTruthy();
  });

  it("duplicating a paired tab duplicates both sides, and deleting it removes both", async () => {
    renderTabsBar(10);
    await waitFor(() => expect(screen.getByTitle("Add page pair (front + back)")).toBeTruthy());
    fireEvent.click(screen.getByTitle("Add page pair (front + back)"));
    await waitFor(() => expect(screen.getAllByTitle("Duplicate pair")).toHaveLength(2));

    fireEvent.click(screen.getAllByTitle("Duplicate pair")[0]);
    await waitFor(() => expect(screen.getAllByTitle("Duplicate pair")).toHaveLength(4));

    fireEvent.click(screen.getAllByTitle("Delete pair (front & back)")[0]);
    await waitFor(() => expect(screen.getAllByTitle("Duplicate pair")).toHaveLength(2));
  });

  it("an unpaired tab's Duplicate/Delete still call the plain single-page methods", async () => {
    renderTabsBar(5);
    await waitFor(() => expect(screen.getByTitle("Duplicate")).toBeTruthy());

    fireEvent.click(screen.getByTitle("Duplicate"));
    await waitFor(() => expect(screen.getByText("Page 1 copy")).toBeTruthy());
    // Only one extra page (not two) — confirms the pair-level path wasn't taken.
    expect(screen.getAllByTitle("Duplicate")).toHaveLength(2);
  });
});
