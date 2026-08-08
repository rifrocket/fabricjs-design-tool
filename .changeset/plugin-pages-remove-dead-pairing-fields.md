---
"@rifrocket/fdt-plugin-pages": patch
---

Remove `PageMeta.pairId`/`side`/`linkedDimensions` — dead API surface with a misleading comment
claiming "PagesManager's pairing helpers" existed to implement front/back page pairing; no such
helpers were ever implemented, and no code (package, demo, or tests) read or wrote these fields.
Front/back pairing may still be worth building, but as a real feature with actual pairing logic
and UI, not three optional fields nobody could ever have populated.
