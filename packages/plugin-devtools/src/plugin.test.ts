import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@rifrocket/fdt-core";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import { devtoolsPlugin } from "./plugin";
import { EventLogPanel } from "./EventLogPanel";
import { CanvasStateViewer } from "./CanvasStateViewer";
import { HistoryPanel } from "./HistoryPanel";
import { HierarchyPanel } from "./HierarchyPanel";
import { PerformanceStats } from "./PerformanceStats";

function createFakeEngine() {
  const registry = new PluginRegistry();
  const engine = { registry } as unknown as CanvasEngine;
  return { engine, registry };
}

describe("devtoolsPlugin", () => {
  it('registers all 5 panels into "sidebar-right", in order', () => {
    const { engine, registry } = createFakeEngine();

    devtoolsPlugin.install(engine);

    expect(registry.panels.getSlot("sidebar-right").map((p) => p.component)).toEqual([
      EventLogPanel,
      CanvasStateViewer,
      HistoryPanel,
      HierarchyPanel,
      PerformanceStats,
    ]);
  });
});
