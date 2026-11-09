/**
 * Biodata data model — the single source of truth for the form AND the
 * templates. Add or reorder fields here and both update automatically.
 *
 * Field `key`s are unique across all sections so a flat `values` map is enough.
 */

export type FieldType = "text" | "date" | "time" | "tel" | "email" | "select" | "textarea" | "combo";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  /** Choices for a `select` (fixed) or `combo` (suggestions you can also type past) field. */
  options?: string[];
}

/** Common heights (4'6"–6'6") for the Height field; users can also type their own. */
export const heightOptions: string[] = Array.from({ length: 25 }, (_, i) => {
  const totalInches = 54 + i; // 4'6" … 6'6"
  const ft = Math.floor(totalInches / 12);
  const inch = totalInches % 12;
  const cm = Math.round(totalInches * 2.54);
  return `${ft}'${inch}" (${cm} cm)`;
});

export type SectionId = "personal" | "family" | "contact";

export interface SectionDef {
  id: SectionId;
  title: string;
  fields: FieldDef[];
}

export const biodataSections: SectionDef[] = [
  {
    id: "personal",
    title: "Personal Details",
    fields: [
      { key: "fullName", label: "Full Name", placeholder: "e.g. Aarav Sharma" },
      { key: "dob", label: "Date of Birth", type: "date" },
      { key: "tob", label: "Time of Birth", type: "time" },
      { key: "pob", label: "Place of Birth", placeholder: "City, State" },
      { key: "height", label: "Height", type: "combo", options: heightOptions, placeholder: `Select or type, e.g. 5'10" (178 cm)` },
      {
        key: "complexion",
        label: "Complexion",
        type: "select",
        options: ["Fair", "Wheatish", "Medium", "Dusky"],
      },
      { key: "bloodGroup", label: "Blood Group", placeholder: "e.g. B+" },
      {
        key: "maritalStatus",
        label: "Marital Status",
        type: "select",
        options: ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"],
      },
      {
        key: "diet",
        label: "Diet",
        type: "select",
        options: ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan", "Jain"],
      },
      { key: "religion", label: "Religion", placeholder: "e.g. Hindu" },
      { key: "caste", label: "Caste / Community", placeholder: "e.g. Brahmin" },
      { key: "gotra", label: "Gotra", placeholder: "e.g. Kashyap" },
      { key: "rashi", label: "Rashi (Moon Sign)", placeholder: "e.g. Vrishabha" },
      { key: "nakshatra", label: "Nakshatra (Star)", placeholder: "e.g. Rohini" },
      {
        key: "manglik",
        label: "Manglik",
        type: "select",
        options: ["No", "Yes", "Anshik (Partial)", "Don't Know"],
      },
      { key: "education", label: "Education", placeholder: "e.g. B.Tech, Computer Science" },
      { key: "occupation", label: "Occupation", placeholder: "e.g. Software Engineer" },
      { key: "income", label: "Annual Income", placeholder: "e.g. ₹12 LPA" },
      { key: "hobbies", label: "Hobbies", type: "textarea", placeholder: "e.g. Reading, Travel, Music" },
    ],
  },
  {
    id: "family",
    title: "Family Details",
    fields: [
      { key: "fatherName", label: "Father's Name", placeholder: "e.g. Rajesh Sharma" },
      { key: "fatherOccupation", label: "Father's Occupation", placeholder: "e.g. Businessman" },
      { key: "motherName", label: "Mother's Name", placeholder: "e.g. Sunita Sharma" },
      { key: "motherOccupation", label: "Mother's Occupation", placeholder: "e.g. Homemaker" },
      { key: "siblings", label: "Siblings", placeholder: "e.g. 1 Brother, 1 Sister (married)" },
      {
        key: "familyType",
        label: "Family Type",
        type: "select",
        options: ["Nuclear Family", "Joint Family"],
      },
      {
        key: "familyValues",
        label: "Family Values",
        type: "select",
        options: ["Traditional", "Moderate", "Liberal"],
      },
      { key: "nativePlace", label: "Native Place", placeholder: "City, State" },
    ],
  },
  {
    id: "contact",
    title: "Contact Details",
    fields: [
      { key: "contactPerson", label: "Contact Person", placeholder: "e.g. Rajesh Sharma (Father)" },
      { key: "phone", label: "Phone", type: "tel", placeholder: "e.g. +91 98765 43210" },
      { key: "email", label: "Email", type: "email", placeholder: "e.g. family@email.com" },
      { key: "address", label: "Address", type: "textarea", placeholder: "Full address for correspondence" },
    ],
  },
];

export interface Biodata {
  /** Heading line at the top, e.g. an invocation. Empty to hide. */
  header: string;
  /** Field values keyed by FieldDef.key. */
  values: Record<string, string>;
  /** Profile photo as a data URL. Kept local until the user chooses to publish. */
  photo?: string;
  /** Omitted by older records: all predefined fields are visible by default. */
  hiddenFields?: string[];
  /** Labels and placement only; values use the stable id in the values map. */
  customRows?: CustomRow[];
}

export interface CustomRow {
  id: string;
  sectionId: SectionId;
  label: string;
}

/** A published biodata, addressable at /<slug>. */
export interface BiodataRecord {
  slug: string;
  templateId: string;
  data: Biodata;
  createdAt: number;
}

/** A short list of common header invocations users can pick from.
 *  Non-empty tuple so `headerPresets[0]` is always a defined string. */
export const headerPresets: [string, ...string[]] = [
  "|| Shri Ganeshaya Namaha ||",
  "॥ श्री गणेशाय नमः ॥",
  "|| Om ||",
  "Marriage Biodata",
  "",
];

export const emptyBiodata: Biodata = {
  header: headerPresets[0],
  values: {},
};

/** Pre-filled example shown on first load so the preview is never blank. */
export const sampleBiodata: Biodata = {
  header: headerPresets[0],
  values: {
    fullName: "Aarav Sharma",
    dob: "1996-04-12",
    tob: "08:45",
    pob: "Pune, Maharashtra",
    height: `5'10" (178 cm)`,
    complexion: "Fair",
    bloodGroup: "B+",
    maritalStatus: "Never Married",
    diet: "Vegetarian",
    religion: "Hindu",
    caste: "Brahmin",
    gotra: "Kashyap",
    rashi: "Vrishabha",
    nakshatra: "Rohini",
    manglik: "No",
    education: "B.Tech, Computer Science",
    occupation: "Software Engineer at a product company",
    income: "₹18 LPA",
    hobbies: "Reading, Travelling, Cricket, Cooking",
    fatherName: "Rajesh Sharma",
    fatherOccupation: "Business",
    motherName: "Sunita Sharma",
    motherOccupation: "Homemaker",
    siblings: "1 elder sister (married)",
    familyType: "Nuclear Family",
    familyValues: "Moderate",
    nativePlace: "Pune, Maharashtra",
    contactPerson: "Rajesh Sharma (Father)",
    phone: "+91 98765 43210",
    email: "sharma.family@email.com",
    address: "12, Shivaji Nagar, Pune, Maharashtra 411005",
  },
};

/** Resolve the same editable rows for the form, every template and exports. */
export function getBiodataSections(data: Biodata): SectionDef[] {
  const hidden = new Set(data.hiddenFields);
  return biodataSections.map((section) => ({
    ...section,
    fields: [
      ...section.fields.filter((field) => !hidden.has(field.key)),
      ...(data.customRows ?? [])
        .filter((row) => row.sectionId === section.id)
        .map((row): FieldDef => ({ key: row.id, label: row.label, type: "textarea" })),
    ],
  }));
}

/** Removing a row also deletes its value, including names used in headings. */
export function removeBiodataRow(data: Biodata, key: string): Biodata {
  const values = { ...data.values };
  delete values[key];
  const predefined = biodataSections.some((section) => section.fields.some((field) => field.key === key));
  return {
    ...data,
    values,
    hiddenFields: predefined ? [...new Set([...(data.hiddenFields ?? []), key])] : data.hiddenFields,
    customRows: data.customRows?.filter((row) => row.id !== key),
  };
}

export function restoreBiodataRow(data: Biodata, key: string): Biodata {
  return { ...data, hiddenFields: data.hiddenFields?.filter((id) => id !== key) };
}

export function customRowError(data: Biodata): string | undefined {
  if (data.customRows?.some((row) => !row.label.trim())) {
    return "Please enter a label for every custom row, or remove the row.";
  }
}

/** Validate JSON at the publishing boundary, including legacy records. */
export function isBiodata(input: unknown): input is Biodata {
  if (!input || typeof input !== "object") return false;
  const data = input as Record<string, unknown>;
  if (typeof data.header !== "string") return false;
  if (data.photo !== undefined && typeof data.photo !== "string") return false;
  if (!data.values || typeof data.values !== "object" || Array.isArray(data.values)) return false;
  if (!Object.values(data.values).every((value) => typeof value === "string")) return false;
  const fieldKeys = new Set(biodataSections.flatMap((section) => section.fields.map((field) => field.key)));
  if (
    data.hiddenFields !== undefined &&
    (!Array.isArray(data.hiddenFields) || !data.hiddenFields.every((key) => typeof key === "string" && fieldKeys.has(key)))
  ) return false;
  if (data.customRows !== undefined) {
    if (!Array.isArray(data.customRows)) return false;
    const ids = new Set<string>();
    for (const row of data.customRows) {
      if (!row || typeof row !== "object") return false;
      if (typeof row.id !== "string" || !/^custom-[a-zA-Z0-9-]+$/.test(row.id) || ids.has(row.id)) return false;
      if (!biodataSections.some((section) => section.id === row.sectionId)) return false;
      if (typeof row.label !== "string" || !row.label.trim()) return false;
      ids.add(row.id);
    }
  }
  return true;
}

/** Whether a field has a meaningful (non-blank) value. */
export function isFieldFilled(field: FieldDef, values: Record<string, string>): boolean {
  return (values[field.key] ?? "").trim().length > 0;
}

/** How many fields in a section the user has filled in — drives the form badges. */
export function filledCount(section: SectionDef, values: Record<string, string>): number {
  return section.fields.filter((field) => isFieldFilled(field, values)).length;
}

/** Helper: format a value for display (e.g. nice date). Empty stays empty. */
export function formatValue(field: FieldDef, value: string | undefined): string {
  if (!value) return "";
  if (field.type === "date") {
    const d = new Date(value + "T00:00:00");
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    }
  }
  return value;
}
