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
  moveBiodataRow,
  normalizeBiodataRowOrder,
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

  describe("custom row ordering", () => {
    const data: Biodata = {
      ...sampleBiodata,
      customRows: [
        { id: "custom-one", sectionId: "personal", label: "Notes" },
        { id: "custom-two", sectionId: "personal", label: "Notes" },
        { id: "custom-family", sectionId: "family", label: "Notes" },
      ],
      values: { ...sampleBiodata.values, "custom-one": "First", "custom-two": "Second", "custom-family": "Family" },
    };
    const keys = (value: Biodata, sectionId = "personal") =>
      getBiodataSections(value).find((section) => section.id === sectionId)!.fields.map((field) => field.key);

    it("keeps the legacy order when metadata is absent", () => {
      expect(keys(data)).toEqual([...biodataSections[0]!.fields.map((field) => field.key), "custom-one", "custom-two"]);
      expect(normalizeBiodataRowOrder(data)).toBeUndefined();
    });

    it("moves custom rows between predefined rows and all the way to the start", () => {
      let moved = moveBiodataRow(data, "personal", "custom-one", "up");
      expect(keys(moved).slice(-4)).toEqual(["income", "custom-one", "hobbies", "custom-two"]);
      while (keys(moved)[0] !== "custom-one") moved = moveBiodataRow(moved, "personal", "custom-one", "up");
      expect(keys(moved).slice(0, 3)).toEqual(["custom-one", "fullName", "dob"]);
      const down = moveBiodataRow(moved, "personal", "custom-one", "down");
      expect(keys(down).slice(0, 3)).toEqual(["fullName", "custom-one", "dob"]);
      expect(moved.values).toBe(data.values);
      expect(moved.customRows).toBe(data.customRows);
      expect(data.rowOrder).toBeUndefined();
    });

    it("independently orders duplicate-label custom rows without affecting other sections", () => {
      const initial: Biodata = { ...data, rowOrder: { family: ["motherName", "custom-family"] } };
      const moved = moveBiodataRow(initial, "personal", "custom-two", "up");
      expect(keys(moved).slice(-2)).toEqual(["custom-two", "custom-one"]);
      expect(keys(moved, "family")).toEqual(keys(initial, "family"));
      expect(keys(moved, "contact")).toEqual(keys(initial, "contact"));
      expect(moved.values["custom-one"]).toBe("First");
      expect(moved.values["custom-two"]).toBe("Second");
    });

    it("does not move beyond a section boundary or move a row from the wrong section", () => {
      const top: Biodata = { ...data, rowOrder: { personal: ["custom-one"] } };
      expect(moveBiodataRow(top, "personal", "custom-one", "up")).toBe(top);
      expect(moveBiodataRow(data, "personal", "custom-two", "down")).toBe(data);
      expect(moveBiodataRow(data, "family", "custom-one", "up")).toBe(data);
      expect(moveBiodataRow(data, "personal", "fullName", "down")).toBe(data);
    });

    it("normalizes stale, unknown, duplicate and wrong-section refs consistently", () => {
      const initial: Biodata = {
        ...data,
        rowOrder: {
          personal: ["custom-two", "unknown", "custom-two", "fatherName", "fullName"],
          family: ["custom-one", "motherName"],
        },
      };
      expect(isBiodata(initial)).toBe(true);
      const normalized = normalizeBiodataRowOrder(initial)!;
      expect(normalized.personal).toEqual(keys(initial));
      expect(normalized.personal?.slice(0, 3)).toEqual(["custom-two", "fullName", "dob"]);
      expect(normalized.personal).toHaveLength(21);
      expect(normalized.family?.[0]).toBe("motherName");
      expect(normalized.family).not.toContain("custom-one");
      expect(initial.rowOrder?.personal).toContain("unknown");
      expect(keys({ ...initial, rowOrder: normalized })).toEqual(keys(initial));
    });

    it("skips removed rows while moving and restores their saved slot", () => {
      const initial: Biodata = { ...data, rowOrder: { personal: ["fullName", "custom-one", "dob"] } };
      const removed = removeBiodataRow(initial, "dob");
      const moved = moveBiodataRow(removed, "personal", "custom-one", "down");
      expect(keys(moved).slice(0, 3)).toEqual(["fullName", "tob", "custom-one"]);
      const restored = restoreBiodataRow(moved, "dob");
      expect(keys(restored).slice(0, 4)).toEqual(["fullName", "dob", "tob", "custom-one"]);
      expect(restored.values.dob).toBeUndefined();
    });

    it("cleans deleted custom ids and appends newly added rows", () => {
      const moved = moveBiodataRow(data, "personal", "custom-two", "up");
      const deleted = removeBiodataRow(moved, "custom-two");
      expect(deleted.rowOrder?.personal).not.toContain("custom-two");
      expect(deleted.values["custom-two"]).toBeUndefined();
      const added: Biodata = { ...deleted, customRows: [...deleted.customRows!, { id: "custom-new", sectionId: "personal", label: "Notes" }] };
      expect(keys(added).at(-1)).toBe("custom-new");
      expect(new Set(keys(added)).size).toBe(keys(added).length);
      expect(keys(JSON.parse(JSON.stringify(added)))).toEqual(keys(added));
    });

    it.each([null, [], { personal: "fullName" }, { personal: [7] }, { other: ["fullName"] }, { personal: null }])(
      "rejects malformed order metadata: %j",
      (rowOrder) => expect(isBiodata({ ...data, rowOrder })).toBe(false),
    );
  });
});
