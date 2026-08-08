# Changesets

This directory manages versioning and changelogs for the v2 monorepo packages under `packages/*`.

`access` is `public`. The repo exited Changesets prerelease mode as of the v3.0.0 stable release (no `.changeset/pre.json` present) — every `version`/`publish` run produces a normal `X.Y.Z` bump and publishes under the `latest` npm dist-tag.

Usage:

```bash
pnpm changeset          # record a change
pnpm changeset:version  # bump versions + changelogs from pending changesets
pnpm changeset:publish  # publish to npm
```

This is separate from the existing v1 package at the repo root, which keeps publishing via its own `npm run build:lib` / `npm publish` flow untouched.
