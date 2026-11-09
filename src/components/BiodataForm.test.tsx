import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BiodataForm from "./BiodataForm";
import { biodataSections, emptyBiodata, sampleBiodata, type Biodata } from "@/data/biodata";
import TraditionalTemplate from "./templates/TraditionalTemplate";

/** Controlled harness so the form actually reflects its own onChange. */
function Harness({ initial, preview = false }: { initial: Biodata; preview?: boolean }) {
  const [data, setData] = useState<Biodata>(initial);
  return <><BiodataForm data={data} onChange={setData} />{preview && <TraditionalTemplate data={data} />}</>;
}

describe("BiodataForm", () => {
  it("edits a field and reflects it back", async () => {
    render(<Harness initial={emptyBiodata} />);
    const input = screen.getByPlaceholderText("e.g. Aarav Sharma");
    await userEvent.type(input, "Priya");
    expect(input).toHaveValue("Priya");
  });

  it("shows a per-section completion badge", () => {
    render(<Harness initial={emptyBiodata} />);
    // Personal Details has 19 fields, none filled in the empty biodata.
    expect(screen.getByText("0/19")).toBeInTheDocument();
  });

  it("loads the sample data", async () => {
    render(<Harness initial={emptyBiodata} />);
    await userEvent.click(screen.getByRole("button", { name: "Load sample" }));
    expect(screen.getByDisplayValue("Aarav Sharma")).toBeInTheDocument();
  });

  it("clears all data", async () => {
    render(<Harness initial={sampleBiodata} />);
    expect(screen.getByDisplayValue("Aarav Sharma")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.queryByDisplayValue("Aarav Sharma")).not.toBeInTheDocument();
  });

  it("rejects a non-image photo upload with an inline error", () => {
    const { container } = render(<Harness initial={emptyBiodata} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const notAnImage = new File(["x"], "resume.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [notAnImage] } });
    expect(screen.getByText(/choose an image file/i)).toBeInTheDocument();
  });

  it("removes and re-adds a predefined row without its old value", async () => {
    render(<Harness initial={sampleBiodata} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Date of Birth row" }));
    expect(screen.queryByLabelText("Date of Birth")).not.toBeInTheDocument();
    expect(screen.getByText("18/18")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Re-add predefined row"), "dob");
    expect(screen.getByLabelText("Date of Birth")).toHaveValue("");
    expect(screen.getByText("18/19")).toBeInTheDocument();
    expect(screen.queryByLabelText("Re-add predefined row")).not.toBeInTheDocument();
  });

  it("adds multiple rows with duplicate labels and independently edits and deletes them", async () => {
    render(<Harness initial={emptyBiodata} />);
    for (const value of ["First value", "Second value"]) {
      await userEvent.click(screen.getByRole("button", { name: "Add custom row" }));
      fireEvent.change(screen.getByLabelText("New row label"), { target: { value: "Education" } });
      fireEvent.change(screen.getByLabelText("New row value"), { target: { value } });
      await userEvent.click(screen.getByRole("button", { name: "Add row", exact: true }));
    }
    const groups = screen.getAllByRole("group", { name: "Education custom row" });
    expect(groups).toHaveLength(2);
    fireEvent.change(within(groups[0]!).getByLabelText("Row label"), { target: { value: "Qualifications" } });
    fireEvent.change(within(groups[0]!).getByLabelText("Row value"), { target: { value: "Updated value" } });
    expect(within(groups[1]!).getByLabelText("Row value")).toHaveValue("Second value");
    await userEvent.click(within(groups[0]!).getByRole("button", { name: "Remove Qualifications row" }));
    expect(screen.queryByDisplayValue("Updated value")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Second value")).toBeInTheDocument();
    expect(screen.getByLabelText("Education")).toHaveValue("");
  });

  it.each(["Family Details", "Contact Details"])("adds a custom row in %s", async (title) => {
    render(<Harness initial={emptyBiodata} />);
    await userEvent.click(screen.getByRole("button", { name: new RegExp(title) }));
    const section = screen.getByRole("button", { name: new RegExp(title) }).closest("section")!;
    const ui = within(section);
    await userEvent.click(ui.getByRole("button", { name: "Add custom row" }));
    fireEvent.change(ui.getByLabelText("New row label"), { target: { value: "Notes" } });
    await userEvent.click(ui.getByRole("button", { name: "Add row", exact: true }));
    expect(ui.getByRole("group", { name: "Notes custom row" })).toBeInTheDocument();
  });

  it("shows inline errors for blank labels when adding and editing", async () => {
    render(<Harness initial={emptyBiodata} />);
    await userEvent.click(screen.getByRole("button", { name: "Add custom row" }));
    await userEvent.click(screen.getByRole("button", { name: "Add row", exact: true }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a label");
    expect(screen.getByLabelText("New row label")).toHaveFocus();
    fireEvent.change(screen.getByLabelText("New row label"), { target: { value: "Notes" } });
    await userEvent.click(screen.getByRole("button", { name: "Add row", exact: true }));
    fireEvent.change(screen.getByLabelText("Row label"), { target: { value: " " } });
    expect(screen.getByLabelText("Row label")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a row label");
  });

  it.each(["Clear all", "Load sample"])("%s restores default rows and removes customizations", async (action) => {
    render(<Harness initial={{
      ...emptyBiodata,
      hiddenFields: ["dob"],
      customRows: [{ id: "custom-one", sectionId: "personal", label: "Notes" }],
      rowOrder: { personal: ["custom-one", "height", "fullName"] },
      values: { "custom-one": "My notes" },
    }} />);
    await userEvent.click(screen.getByRole("button", { name: "Add custom row" }));
    fireEvent.change(screen.getByLabelText("New row label"), { target: { value: "Unsubmitted draft" } });
    await userEvent.click(screen.getByRole("button", { name: action }));
    expect(screen.getByLabelText("Date of Birth")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Notes custom row" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Re-add predefined row")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("New row label")).not.toBeInTheDocument();
    const rows = document.querySelectorAll("#section-personal [data-row-id]");
    expect(Array.from(rows, (row) => row.getAttribute("data-row-id"))).toEqual(biodataSections[0]!.fields.map((field) => field.key));
  });

  it("moves a new custom row between predefined rows and immediately updates the preview", async () => {
    const { container } = render(<Harness initial={{
      ...sampleBiodata,
      customRows: [{ id: "custom-one", sectionId: "personal", label: "Notes" }],
      values: { ...sampleBiodata.values, "custom-one": "Custom value" },
    }} preview />);
    const up = screen.getByRole("button", { name: "Move Notes row up" });
    expect(screen.getByRole("button", { name: "Move Notes row down" })).toBeDisabled();
    await userEvent.click(up);
    const ids = Array.from(container.querySelectorAll("#section-personal [data-row-id]"), (row) => row.getAttribute("data-row-id"));
    expect(ids.slice(-3)).toEqual(["income", "custom-one", "hobbies"]);
    const previewIds = Array.from(container.querySelectorAll(".a4 [data-biodata-row]"), (row) => row.getAttribute("data-biodata-row"));
    expect(previewIds.indexOf("custom-one")).toBeLessThan(previewIds.indexOf("hobbies"));
    expect(previewIds.indexOf("custom-one")).toBeGreaterThan(previewIds.indexOf("income"));
    expect(screen.getByRole("status")).toHaveTextContent("Position 19 of 20");
    await waitFor(() => expect(up).toHaveFocus());
  });

  it("supports top/bottom boundaries and retains the same label input and keyboard focus", async () => {
    render(<Harness initial={{
      ...sampleBiodata,
      customRows: [{ id: "custom-one", sectionId: "personal", label: "Notes" }],
      rowOrder: { personal: ["custom-one"] },
    }} />);
    const label = screen.getByLabelText("Row label");
    const up = screen.getByRole("button", { name: "Move Notes row up" });
    const down = screen.getByRole("button", { name: "Move Notes row down" });
    expect(up).toBeDisabled();
    down.focus();
    await userEvent.keyboard("{Enter}");
    expect(up).toBeEnabled();
    expect(screen.getByLabelText("Row label")).toBe(label);
    expect(document.querySelector("#section-personal [data-row-id]")).toHaveAttribute("data-row-id", "fullName");
    await userEvent.click(up);
    expect(up).toBeDisabled();
    await waitFor(() => expect(down).toHaveFocus());
  });

  it("moves duplicate-label rows independently and preserves restored standard row positions", async () => {
    render(<Harness initial={{
      ...sampleBiodata,
      customRows: [
        { id: "custom-one", sectionId: "personal", label: "Notes" },
        { id: "custom-two", sectionId: "personal", label: "Notes" },
        { id: "custom-family", sectionId: "family", label: "Notes" },
      ],
      values: { ...sampleBiodata.values, "custom-one": "First", "custom-two": "Second" },
      rowOrder: { personal: ["fullName", "custom-one", "dob", "custom-two"], family: ["custom-family"] },
    }} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Date of Birth row" }));
    await userEvent.selectOptions(screen.getByLabelText("Re-add predefined row"), "dob");
    const rows = () => Array.from(document.querySelectorAll("#section-personal [data-row-id]"), (row) => row.getAttribute("data-row-id"));
    expect(rows().slice(0, 4)).toEqual(["fullName", "custom-one", "dob", "custom-two"]);
    const second = document.querySelector('[data-row-id="custom-two"]') as HTMLElement;
    await userEvent.click(within(second).getByRole("button", { name: "Move Notes row up" }));
    expect(rows().slice(0, 4)).toEqual(["fullName", "custom-one", "custom-two", "dob"]);
    expect(within(second).getByLabelText("Row value")).toHaveValue("Second");
    await userEvent.click(within(second).getByRole("button", { name: "Remove Notes row" }));
    expect(rows().slice(0, 3)).toEqual(["fullName", "custom-one", "dob"]);
    await userEvent.click(screen.getByRole("button", { name: /Family Details/ }));
    expect(document.querySelector("#section-family [data-row-id]")).toHaveAttribute("data-row-id", "custom-family");
  });
});
