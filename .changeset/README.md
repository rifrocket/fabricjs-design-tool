# Changesets

This directory manages versioning and changelogs for the v2 monorepo packages under `packages/*`.

`access` is set to `restricted` because these packages are currently `private: true` scaffolds and are not yet published to npm. Flip each package's `private` field to `false` and this config's `access` to `public` when the v2.0.0-alpha packages are ready to publish.

Usage once packages are being actively developed:

```bash
pnpm changeset          # record a change
pnpm changeset:version  # bump versions + changelogs from pending changesets
pnpm changeset:publish  # publish to npm
```

This is separate from the existing v1 package at the repo root, which keeps publishing via its own `npm run build:lib` / `npm publish` flow untouched.
