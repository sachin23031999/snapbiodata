import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { templates } from "./index";
import { displayName, renderedSections } from "./shared";
import { biodataSections, sampleBiodata, type Biodata } from "@/data/biodata";
import { downloadBiodataPdf } from "@/lib/pdf";

const mocks = vi.hoisted(() => ({ capture: vi.fn(), save: vi.fn() }));
vi.mock("html2canvas-pro", () => ({ default: mocks.capture }));
vi.mock("jspdf", () => ({
  jsPDF: vi.fn(() => ({ addPage: vi.fn(), addImage: vi.fn(), save: mocks.save })),
}));

const data: Biodata = {
  ...sampleBiodata,
  hiddenFields: ["dob", "fatherName", "phone"],
  customRows: [
    { id: "custom-one", sectionId: "personal", label: "Education" },
    { id: "custom-two", sectionId: "personal", label: "Education" },
    { id: "custom-family", sectionId: "family", label: "Family note" },
    { id: "custom-contact", sectionId: "contact", label: "Contact note" },
  ],
  values: {
    ...sampleBiodata.values,
    "custom-one": "Extra qualification A",
    "custom-two": "Extra qualification B",
    "custom-family": "Family custom value",
    "custom-contact": "Contact custom value",
  },
};

describe("template row resolution", () => {
  it("preserves the default fields and date formatting for legacy records", () => {
    const sections = renderedSections(sampleBiodata);
    expect(sections.map((section) => section.rows.length)).toEqual([19, 8, 4]);
    expect(sections[0]!.rows.map((row) => row.id)).toEqual(biodataSections[0]!.fields.map((field) => field.key));
    expect(sections[0]!.rows[1]!.value).toBe("12 April 1996");
  });

  it("resolves custom and predefined duplicate labels with different stable ids", () => {
    const rows = renderedSections(data)[0]!.rows.filter((row) => row.label === "Education");
    expect(rows.map((row) => row.id)).toEqual(["education", "custom-one", "custom-two"]);
    expect(rows.map((row) => row.value)).toEqual(["B.Tech, Computer Science", "Extra qualification A", "Extra qualification B"]);
  });

  it("omits empty sections, values, and invalid draft labels", () => {
    expect(renderedSections({
      header: "",
      values: { "custom-one": " ", "custom-two": "Value" },
      customRows: [
        { id: "custom-one", sectionId: "personal", label: "Note" },
        { id: "custom-two", sectionId: "family", label: " " },
      ],
    })).toEqual([]);
  });

  it("does not leak a removed full name into template headings or published metadata", () => {
    expect(displayName({ ...sampleBiodata, hiddenFields: ["fullName"] })).toBe("Your Name");
  });

  it.each(templates)("renders and exports customized rows in $name", async ({ Component }) => {
    const error = vi.spyOn(console, "error");
    const { container } = render(<Component data={data} />);
    const pages = Array.from(container.querySelectorAll<HTMLElement>(".a4"));
    expect(pages.length).toBeGreaterThan(0);
    const text = pages.map((page) => page.textContent).join("");
    expect(text).not.toContain("12 April 1996");
    expect(text).not.toContain("Father's Name");
    expect(text).not.toContain("+91 98765 43210");
    for (const value of ["Extra qualification A", "Extra qualification B", "Family custom value", "Contact custom value"]) {
      expect(text).toContain(value);
    }
    mocks.capture.mockClear();
    mocks.capture.mockResolvedValue({ toDataURL: () => "data:image/jpeg;base64,AAAA" });
    await downloadBiodataPdf(container, "customized.pdf");
    expect(mocks.capture.mock.calls.map(([page]) => page)).toEqual(pages);
    expect(mocks.save).toHaveBeenLastCalledWith("customized.pdf");
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
