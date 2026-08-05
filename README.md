# Fabric Design Tool

<div align="center">
  <img src="apps/docs/static/img/logo-large.svg" alt="Fabric Design Tool" width="500"/>
</div>

> A Fabric.js-based design tool engine, React adapter, theme, and plugin ecosystem — split into small, independently installable packages.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

This is a pnpm/turborepo monorepo. Every package under `packages/*` publishes to npm under the `beta` dist-tag via [Changesets](.changeset/README.md).

## Architecture

| Package | Purpose |
|---|---|
| [`@rifrocket/fdt-core`](packages/core) | Framework-agnostic canvas engine (`CanvasEngine`, registries, store, `createEditor()`) |
| [`@rifrocket/fdt-react`](packages/react) | React adapter (`<Editor>`, `<DesignEditor>`, hooks) |
| [`@rifrocket/fdt-theme`](packages/theme) | CSS design tokens, light/dark theming |
| [`@rifrocket/fdt-properties`](packages/properties) | Shared property-field components (slider, number, color, toggle, select, text) |
| `@rifrocket/fdt-plugin-*` | Optional engine plugins — shapes, QR codes, SVG import, images, clipboard, PDF export, JSON import, effects, local-storage autosave, alignment, snapping, dev tools, pan/zoom |

See [`packages/README.md`](packages/README.md) for the full plugin list and what each one does, and [`apps/demo`](apps/demo) for a working consumer that wires these packages together through the public `<Editor>` API.

## Getting started (working in this repo)

```bash
git clone https://github.com/rifrocket/fabricjs-design-tool.git
cd fabricjs-design-tool
pnpm install
```

Common scripts (see [`package.json`](package.json) for the full list):

```bash
pnpm packages:build       # build all packages/*
pnpm packages:test        # test all packages/*
pnpm packages:lint        # lint all packages/*
pnpm packages:typecheck   # typecheck all packages/*
pnpm apps:dev             # run the demo app
pnpm apps:build           # build the demo app
```

Versioning/publishing goes through [Changesets](.changeset/README.md).

## Usage

Once published, consumers will install only the packages they need. The React adapter's `<DesignEditor>` is the batteries-included entry point:

```tsx
import { DesignEditor } from "@rifrocket/fdt-react";

function App() {
  return <DesignEditor preset="default" theme="system" width={800} height={600} />;
}
```

For direct engine access (framework-agnostic core, or a custom plugin set), use `<Editor>` and `useEditor()` from the same package — see [`packages/react/src/quickstart.example.tsx`](packages/react/src/quickstart.example.tsx), which is typechecked on every build so it can't drift from the real API.

## Documentation

- **[Documentation site](https://rifrocket.github.io/fabricjs-design-tool/)** — installation, quick start, architecture, every plugin, extension points, and guides (source: [`apps/docs`](apps/docs))

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes, keeping packages independently buildable.
3. Run `pnpm packages:lint`, `pnpm packages:typecheck`, and `pnpm packages:test` before submitting.
4. Add a changeset (`pnpm changeset`) describing your change.
5. Open a pull request.

Releases are automatic from there: merging a PR that carries a changeset triggers `.github/workflows/release.yml`, which opens (or updates) a "Version Packages" PR bumping every changed package and rolling up the changelogs. Merging that PR publishes the new versions to npm under the `beta` dist-tag — no manual `npm publish` involved.

## License

[MIT](LICENSE) © FabricJS Design Tool Contributors

## Links

- [Report Issues](https://github.com/rifrocket/fabricjs-design-tool/issues)
- [Repository](https://github.com/rifrocket/fabricjs-design-tool)
- [Live Demo](https://rifrocket.github.io/fabricjs-design-tool/demo/)
