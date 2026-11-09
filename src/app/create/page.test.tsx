import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatePage from "./page";

vi.mock("@/components/BiodataPreview", () => ({ default: () => <div id="print-area" /> }));
vi.mock("@/components/TemplatePicker", () => ({ default: () => null }));

describe("custom row export validation", () => {
  it.each(["Download PDF", "Share"])("blocks %s for a blank edited label and surfaces feedback", async (action) => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<CreatePage />);
    await userEvent.click(screen.getByRole("button", { name: "Add custom row" }));
    fireEvent.change(screen.getByLabelText("New row label"), { target: { value: "Notes" } });
    fireEvent.change(screen.getByLabelText("New row value"), { target: { value: "A note" } });
    await userEvent.click(screen.getByRole("button", { name: "Add row", exact: true }));
    fireEvent.change(screen.getByLabelText("Row label"), { target: { value: " " } });
    await userEvent.click(screen.getAllByRole("button", { name: action })[0]!);
    expect(alert).toHaveBeenCalledWith("Please enter a label for every custom row, or remove the row.");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a row label");
    alert.mockRestore();
  });
});
