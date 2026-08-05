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
