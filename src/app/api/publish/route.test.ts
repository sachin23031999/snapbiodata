import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { sampleBiodata, type BiodataRecord } from "@/data/biodata";
import { renderedSections } from "@/components/templates/shared";

const store = vi.hoisted(() => ({ putRecord: vi.fn(), slugExists: vi.fn() }));
vi.mock("@/lib/store", () => store);

function publish(data: unknown, extra = {}) {
  return POST(new Request("http://localhost/api/publish", {
    method: "POST",
    body: JSON.stringify({ data, ...extra }),
  }));
}

describe("publishing customized biodata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.slugExists.mockResolvedValue(false);
    store.putRecord.mockResolvedValue(undefined);
  });

  it("still publishes legacy biodata without row settings", async () => {
    const result = await publish(sampleBiodata);
    expect(result.status).toBe(200);
    expect(store.putRecord).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ header: sampleBiodata.header, values: sampleBiodata.values }),
    }));
  });

  it("preserves the existing default for an omitted heading", async () => {
    const result = await publish({ values: sampleBiodata.values });
    expect(result.status).toBe(200);
    expect(store.putRecord.mock.calls[0]![0].data.header).toBe("");
  });

  it("persists customization and renders the same rows after a storage JSON round trip", async () => {
    const data = {
      ...sampleBiodata,
      hiddenFields: ["dob"],
      customRows: [
        { id: "custom-one", sectionId: "family", label: "Notes" },
        { id: "custom-two", sectionId: "family", label: "Notes" },
      ],
      values: { ...sampleBiodata.values, "custom-one": "First note", "custom-two": "Second note" },
    };
    const response = await publish(data, { templateId: "royal" });
    expect(response.status).toBe(200);
    const saved = store.putRecord.mock.calls[0]![0] as BiodataRecord;
    const loaded: BiodataRecord = JSON.parse(JSON.stringify(saved));
    expect(loaded.data).toEqual(data);
    expect(loaded.templateId).toBe("royal");
    expect(renderedSections(loaded.data)).toEqual(renderedSections(data));
    expect(renderedSections(loaded.data)[0]!.rows.some((row) => row.id === "dob")).toBe(false);
  });

  it.each([
    { ...sampleBiodata, customRows: [{ id: "custom-one", sectionId: "family", label: " " }] },
    { ...sampleBiodata, customRows: [{ id: "custom-one", sectionId: "other", label: "Note" }] },
    { ...sampleBiodata, values: { fullName: 42 } },
  ])("rejects invalid rows with normal API feedback", async (data) => {
    const response = await publish(data);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.stringMatching(/invalid biodata/i) });
    expect(store.putRecord).not.toHaveBeenCalled();
  });

  it("keeps the existing full-name requirement even if that row is removed", async () => {
    const response = await publish({ ...sampleBiodata, hiddenFields: ["fullName"] });
    expect(response.status).toBe(400);
    expect(store.putRecord).not.toHaveBeenCalled();
  });

  it("normalizes and persists custom rows before/between standard rows across a JSON round trip", async () => {
    const data = {
      ...sampleBiodata,
      hiddenFields: ["dob"],
      customRows: [
        { id: "custom-one", sectionId: "personal", label: "Notes" },
        { id: "custom-two", sectionId: "personal", label: "Notes" },
      ],
      values: { ...sampleBiodata.values, "custom-one": "First", "custom-two": "Second" },
      rowOrder: { personal: ["custom-two", "fullName", "unknown", "custom-one", "custom-two", "fatherName"] },
    };
    const response = await publish(data);
    expect(response.status).toBe(200);
    const loaded: BiodataRecord = JSON.parse(JSON.stringify(store.putRecord.mock.calls[0]![0]));
    expect(loaded.data.rowOrder?.personal?.slice(0, 4)).toEqual(["custom-two", "fullName", "custom-one", "dob"]);
    expect(loaded.data.rowOrder?.personal).toHaveLength(21);
    expect(loaded.data.rowOrder?.personal).not.toContain("unknown");
    expect(loaded.data.rowOrder?.personal).not.toContain("fatherName");
    expect(renderedSections(loaded.data)).toEqual(renderedSections(data));
    expect(renderedSections(loaded.data)[0]!.rows.slice(0, 3).map((row) => row.id)).toEqual(["custom-two", "fullName", "custom-one"]);
  });

  it.each([null, [], { personal: "fullName" }, { personal: [42] }, { invalid: ["fullName"] }])(
    "rejects malformed row order with explicit API feedback: %j",
    async (rowOrder) => {
      const response = await publish({ ...sampleBiodata, rowOrder });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: expect.stringMatching(/invalid biodata/i) });
      expect(store.putRecord).not.toHaveBeenCalled();
    },
  );
});
