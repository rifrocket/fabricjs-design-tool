import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { Canvas, FabricObject } from "fabric";
import { AddObjectCommand, RemoveObjectCommand } from "./canvasCommands";
import type { ObjectMutationSurface } from "./canvasCommands";

function createFakeSurface(overrides: Partial<ObjectMutationSurface> = {}): ObjectMutationSurface {
  return {
    addNode: vi.fn(),
    removeNode: vi.fn(),
    getNodes: vi.fn().mockReturnValue([]),
    requestRender: vi.fn(),
    setActiveNode: vi.fn(),
    getActiveNodes: vi.fn().mockReturnValue([]),
    clearSelection: vi.fn(),
    ...overrides,
  };
}

function createFakeCanvas(overrides: Partial<Canvas> = {}): Canvas {
  const objects: FabricObject[] = [];
  return {
    add: vi.fn((object: FabricObject) => objects.push(object)),
    remove: vi.fn((object: FabricObject) => {
      const index = objects.indexOf(object);
      if (index >= 0) objects.splice(index, 1);
    }),
    getObjects: vi.fn(() => objects),
    requestRenderAll: vi.fn(),
    getActiveObjects: vi.fn().mockReturnValue([]),
    setActiveObject: vi.fn(),
    getActiveObject: vi.fn(),
    discardActiveObject: vi.fn(),
    ...overrides,
  } as unknown as Canvas;
}

describe("AddObjectCommand", () => {
  it("against an ObjectMutationSurface: do() adds+selects+renders, undo() removes+renders", () => {
    const surface = createFakeSurface();
    const rect = new Rect();
    const command = new AddObjectCommand(surface, rect);

    command.do();
    expect(surface.addNode).toHaveBeenCalledWith(rect);
    expect(surface.setActiveNode).toHaveBeenCalledWith(rect);
    expect(surface.requestRender).toHaveBeenCalledTimes(1);

    command.undo();
    expect(surface.removeNode).toHaveBeenCalledWith(rect);
    expect(surface.requestRender).toHaveBeenCalledTimes(2);
  });

  it("against a legacy raw Canvas: normalizes to an equivalent surface and mutates real canvas state", () => {
    const canvas = createFakeCanvas();
    const rect = new Rect();
    const command = new AddObjectCommand(canvas, rect);

    command.do();
    expect(canvas.add).toHaveBeenCalledWith(rect);
    expect(canvas.setActiveObject).toHaveBeenCalledWith(rect);
    // SelectionManager.select() (invoked by setActiveNode) already calls requestRenderAll()
    // itself, plus AddObjectCommand's own explicit requestRender() call — 2 calls total.
    expect(canvas.requestRenderAll).toHaveBeenCalledTimes(2);
    expect(canvas.getObjects()).toEqual([rect]);

    command.undo();
    expect(canvas.remove).toHaveBeenCalledWith(rect);
    expect(canvas.getObjects()).toEqual([]);
  });
});

describe("RemoveObjectCommand", () => {
  it("against an ObjectMutationSurface: do() removes+renders, undo() re-adds+renders", () => {
    const surface = createFakeSurface();
    const rect = new Rect();
    const command = new RemoveObjectCommand(surface, rect);

    command.do();
    expect(surface.removeNode).toHaveBeenCalledWith(rect);
    expect(surface.requestRender).toHaveBeenCalledTimes(1);

    command.undo();
    expect(surface.addNode).toHaveBeenCalledWith(rect);
    expect(surface.requestRender).toHaveBeenCalledTimes(2);
  });

  it("against a legacy raw Canvas: normalizes to an equivalent surface and mutates real canvas state", () => {
    const canvas = createFakeCanvas();
    const rect = new Rect();
    canvas.add(rect);

    const command = new RemoveObjectCommand(canvas, rect);

    command.do();
    expect(canvas.remove).toHaveBeenCalledWith(rect);
    expect(canvas.getObjects()).toEqual([]);

    command.undo();
    expect(canvas.add).toHaveBeenCalledWith(rect);
    expect(canvas.getObjects()).toEqual([rect]);
  });
});
