import { describe, it, expect } from "vitest";
import {
  formatValue,
  isFieldFilled,
  filledCount,
  biodataSections,
  emptyBiodata,
  sampleBiodata,
  getBiodataSections,
  removeBiodataRow,
  restoreBiodataRow,
  customRowError,
  isBiodata,
  type Biodata,
  type FieldDef,
} from "./biodata";

const dateField: FieldDef = { key: "dob", label: "Date of Birth", type: "date" };
const textField: FieldDef = { key: "fullName", label: "Full Name" };

describe("formatValue", () => {
  it("formats a valid date as a readable string", () => {
    expect(formatValue(dateField, "1996-04-12")).toBe("12 April 1996");
  });

  describe("customizable rows", () => {
    const customized: Biodata = {
      ...sampleBiodata,
      hiddenFields: ["dob"],
      customRows: [
        { id: "custom-one", sectionId: "personal", label: "Education" },
        { id: "custom-two", sectionId: "personal", label: "Education" },
        { id: "custom-three", sectionId: "family", label: "Family note" },
      ],
      values: { ...sampleBiodata.values, "custom-one": "Diploma", "custom-two": "Masters", "custom-three": "Hello" },
    };

    it("uses every predefined field for legacy data without customization", () => {
      expect(getBiodataSections(sampleBiodata)).toEqual(biodataSections);
      expect(getBiodataSections(emptyBiodata)).toEqual(biodataSections);
      expect(isBiodata(JSON.parse(JSON.stringify(sampleBiodata)))).toBe(true);
    });

    it("removes values immutably and restores predefined rows in their original position", () => {
      const removed = removeBiodataRow(sampleBiodata, "dob");
      expect(removed.values.dob).toBeUndefined();
      expect(sampleBiodata.values.dob).toBe("1996-04-12");
      expect(getBiodataSections(removed)[0]!.fields.some((field) => field.key === "dob")).toBe(false);
      const restored = restoreBiodataRow(removed, "dob");
      expect(getBiodataSections(restored)).toEqual(biodataSections);
      expect(restored.values.dob).toBeUndefined();
      expect(removeBiodataRow(removed, "dob").hiddenFields).toEqual(["dob"]);
    });

    it("keeps duplicate labels independent and custom rows in their sections", () => {
      const sections = getBiodataSections(customized);
      expect(sections[0]!.fields.slice(-2).map((field) => field.key)).toEqual(["custom-one", "custom-two"]);
      expect(sections[1]!.fields.at(-1)?.key).toBe("custom-three");
      const deleted = removeBiodataRow(customized, "custom-one");
      expect(deleted.customRows?.map((row) => row.id)).toEqual(["custom-two", "custom-three"]);
      expect(deleted.values["custom-one"]).toBeUndefined();
      expect(deleted.values["custom-two"]).toBe("Masters");
      expect(customized.customRows).toHaveLength(3);
    });

    it("counts only visible fields including custom rows", () => {
      const section = getBiodataSections(customized)[0]!;
      expect(filledCount(section, customized.values)).toBe(20);
    });

    it("preserves ids, labels, values and hidden fields through JSON persistence", () => {
      const restored: unknown = JSON.parse(JSON.stringify(customized));
      expect(isBiodata(restored)).toBe(true);
      expect(restored).toEqual(customized);
    });

    it("requires nonblank custom labels but allows duplicate and predefined labels", () => {
      expect(customRowError(customized)).toBeUndefined();
      expect(isBiodata(customized)).toBe(true);
      const invalid = { ...customized, customRows: [{ id: "custom-one", sectionId: "personal" as const, label: "  " }] };
      expect(customRowError(invalid)).toMatch(/label/);
      expect(isBiodata(invalid)).toBe(false);
    });

    it.each([
      null,
      { ...emptyBiodata, values: [] },
      { ...emptyBiodata, values: { fullName: 42 } },
      { ...emptyBiodata, hiddenFields: ["unknown"] },
      { ...emptyBiodata, customRows: {} },
      { ...emptyBiodata, customRows: [null] },
      { ...emptyBiodata, customRows: [{ id: "fullName", sectionId: "personal", label: "Name" }] },
      { ...emptyBiodata, customRows: [{ id: "custom-one", sectionId: "unknown", label: "Note" }] },
      { ...emptyBiodata, customRows: [customized.customRows![0], customized.customRows![0]] },
    ])("rejects malformed or colliding row data: %j", (data) => {
      expect(isBiodata(data)).toBe(false);
    });
  });

  it("returns empty for an empty value", () => {
    expect(formatValue(dateField, "")).toBe("");
    expect(formatValue(textField, undefined)).toBe("");
  });

  it("passes through non-date values unchanged", () => {
    expect(formatValue(textField, "Aarav Sharma")).toBe("Aarav Sharma");
  });

  it("leaves an unparseable date untouched", () => {
    expect(formatValue(dateField, "not-a-date")).toBe("not-a-date");
  });
});

describe("isFieldFilled", () => {
  it("is false for missing or blank values", () => {
    expect(isFieldFilled(textField, {})).toBe(false);
    expect(isFieldFilled(textField, { fullName: "   " })).toBe(false);
  });

  it("is true for a real value", () => {
    expect(isFieldFilled(textField, { fullName: "Aarav" })).toBe(true);
  });
});

describe("filledCount", () => {
  const personal = biodataSections.find((s) => s.id === "personal")!;

  it("counts only filled fields", () => {
    expect(filledCount(personal, {})).toBe(0);
    expect(filledCount(personal, { fullName: "Aarav", height: "5'10\"" })).toBe(2);
  });
});
