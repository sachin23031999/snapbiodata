import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import FramedDoc from "./FramedDoc";
import { emptyBiodata, type Biodata } from "@/data/biodata";

describe("FramedDoc customization layout", () => {
  it("re-measures label-only edits and row removal without reusing stale pages or refs", () => {
    const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
      return this.textContent?.includes("Expanded label") ? 750 : 100;
    });
    const data: Biodata = {
      ...emptyBiodata,
      customRows: [
        { id: "custom-one", sectionId: "personal", label: "Short" },
        { id: "custom-two", sectionId: "personal", label: "Note" },
        { id: "custom-three", sectionId: "personal", label: "Note" },
      ],
      values: { "custom-one": "First", "custom-two": "Second", "custom-three": "Third" },
    };
    const doc = (data: Biodata) => (
      <FramedDoc
        data={data}
        padX={20}
        padTop={20}
        padBottom={20}
        frame={() => null}
        renderHeading={(title) => <h2>{title}</h2>}
        renderRow={(row) => <p>{row.label}: {row.value}</p>}
      />
    );
    const { container, rerender } = render(doc(data));
    expect(container.querySelectorAll(".a4")).toHaveLength(1);
    rerender(doc({
      ...data,
      customRows: data.customRows!.map((row, i) => i === 0 ? { ...row, label: "Expanded label" } : row),
    }));
    expect(container.querySelectorAll(".a4")).toHaveLength(2);
    rerender(doc({ ...data, customRows: data.customRows!.slice(1) }));
    expect(container.querySelectorAll(".a4")).toHaveLength(1);
    expect(container.querySelector(".a4")).not.toHaveTextContent("First");
    expect(container.querySelector(".a4")).toHaveTextContent("Second");
    expect(container.querySelector(".a4")).toHaveTextContent("Third");
    height.mockRestore();
  });
});
