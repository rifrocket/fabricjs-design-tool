/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "core-no-react",
      severity: "error",
      comment:
        "packages/core must stay framework-agnostic (docs/REVAMP_PLAN.md §9.1) — it must never depend on react, react-dom, or packages/react. A physical package boundary is enforced here because a lint rule inside one file can't guarantee this the way a cross-package dependency check can.",
      from: { path: "^packages/core/src" },
      to: {
        path: "(^|/)node_modules/(react|react-dom)(/|$)|^packages/react",
      },
    },
    {
      name: "document-assets-no-renderer",
      severity: "error",
      comment:
        "FUTURE_IMPLEMENTATION.md Stage 6: the canonical, renderer-neutral document model (packages/core/src/document/canonicalDocument.ts) and the asset abstraction (packages/core/src/assets/**) must be loadable/saveable/usable with zero renderer present — no fabric, no DOM. Scoped to canonicalDocument.ts specifically, NOT the whole document/ directory: packages/core/src/document/snapshot.ts and objectTypeSerialization.ts (Stage 5's Fabric compatibility layer) and canonicalSceneSync.ts (Stage 6's renderer-touching scene-sync half — deliberately typed against FabricObject/RendererApi<FabricObject> for now, not yet generic; confirmed via Chunk 6.5's audit that it genuinely imports `fabric` (FabricObject, plus transitively via resolveObjectTypeId), contradicting an earlier assumption in the roadmap that it wouldn't) are all intentionally Fabric-coupled, a different contract than canonicalDocument.ts's renderer-free one. Widen this rule's `from` to cover more of document/ only if a specific new file is confirmed to need the same renderer-free guarantee.",
      from: { path: "^packages/core/src/(document/canonicalDocument\\.ts|assets/)" },
      to: {
        path: "(^|/)node_modules/fabric(/|$)|^packages/core/src/engine/fabricRendererApi",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.base.json",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
