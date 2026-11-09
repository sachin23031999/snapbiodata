import { getBiodataSections, formatValue, type Biodata } from "@/data/biodata";

export interface TemplateProps {
  data: Biodata;
}

export interface RenderedRow {
  id: string;
  label: string;
  value: string;
}

export interface RenderedSection {
  id: string;
  title: string;
  rows: RenderedRow[];
}

/** Build the list of non-empty rows per section, ready for templates to render. */
export function renderedSections(data: Biodata): RenderedSection[] {
  return getBiodataSections(data)
    .map((section) => ({
      id: section.id,
      title: section.title,
      rows: section.fields
        .map((field) => ({ id: field.key, label: field.label.trim(), value: formatValue(field, data.values[field.key]) }))
        .filter((row) => row.label.length > 0 && row.value.trim().length > 0),
    }))
    .filter((section) => section.rows.length > 0);
}

/** The full name, with a sensible fallback for the preview. */
export function displayName(data: Biodata): string {
  return (!data.hiddenFields?.includes("fullName") && data.values.fullName?.trim()) || "Your Name";
}
