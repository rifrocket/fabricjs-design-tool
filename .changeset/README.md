# Changesets

This directory manages versioning and changelogs for the v2 monorepo packages under `packages/*`.

`access` is `public` and the repo is in Changesets prerelease mode (`.changeset/pre.json`, tag `alpha`) — every `version`/`publish` run produces `X.Y.Z-alpha.N` and publishes under the `alpha` npm dist-tag.

Usage once packages are being actively developed:

```bash
pnpm changeset          # record a change
pnpm changeset:version  # bump versions + changelogs from pending changesets
pnpm changeset:publish  # publish to npm
```

This is separate from the existing v1 package at the repo root, which keeps publishing via its own `npm run build:lib` / `npm publish` flow untouched.
