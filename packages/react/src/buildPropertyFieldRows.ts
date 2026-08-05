import type { PropertyFieldDefinition } from "@rifrocket/fabricjs-design-tool";

export interface PropertyFieldRow {
  // React key for the row — the joined keys of whichever field(s) landed in it.
  key: string;
  // Only set on the first row of a new section; PropertiesPanel renders a heading above the row
  // when present. `isFirstSection` distinguishes the very first heading in the whole list (which
  // sits directly under the panel's own "Properties" title and shouldn't get a divider above it)
  // from later ones (which do).
  sectionHeader?: { text: string; isFirstSection: boolean };
  fields: PropertyFieldDefinition[];
}

// Chunks a flat, per-type field list (as resolvePropertyFields returns it) into rows for
// PropertiesPanel: two consecutive fields sharing one `span: "half"` section pair up into a
// single 2-column row; everything else (no span, span: "full", or a lone half-field with no
// half-field neighbor in its own section) gets its own full-width row. Fields with no `section`
// behave exactly as the old flat list did — one full-width row, no heading.
export function buildPropertyFieldRows(fields: PropertyFieldDefinition[]): PropertyFieldRow[] {
  const rows: PropertyFieldRow[] = [];
  let lastSection: string | undefined;
  let sawSection = false;

  for (let i = 0; i < fields.length; i += 1) {
    const current = fields[i];
    const next = fields[i + 1];
    const pairsWithNext = current.span === "half" && next?.span === "half" && next.section === current.section;
    const rowFields = pairsWithNext ? [current, next] : [current];
    if (pairsWithNext) i += 1;

    const sectionHeader =
      current.section !== undefined && current.section !== lastSection
        ? { text: current.section, isFirstSection: !sawSection }
        : undefined;
    if (sectionHeader) sawSection = true;
    lastSection = current.section;

    rows.push({ key: rowFields.map((f) => f.key).join("+"), sectionHeader, fields: rowFields });
  }

  return rows;
}
