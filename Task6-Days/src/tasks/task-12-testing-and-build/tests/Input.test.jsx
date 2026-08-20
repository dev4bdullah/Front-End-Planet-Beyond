import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@ui";

describe("Input", () => {
  it("associates the label with the field", () => {
    render(<Input label="Email address" />);
    // getByLabelText only passes if htmlFor and id actually match
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("generates unique ids for two instances", () => {
    render(
      <>
        <Input label="First" />
        <Input label="Second" />
      </>
    );

    expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id);
  });

  it("exposes the error to assistive tech", () => {
    render(<Input label="Email" error="That domain looks wrong" />);

    const field = screen.getByLabelText("Email");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("That domain looks wrong");
    expect(field).toHaveAccessibleDescription("That domain looks wrong");
  });

  it("shows the hint only while there is no error", () => {
    const { rerender } = render(<Input label="Email" hint="For receipts" />);
    expect(screen.getByText("For receipts")).toBeInTheDocument();

    rerender(<Input label="Email" hint="For receipts" error="Required" />);
    expect(screen.queryByText("For receipts")).not.toBeInTheDocument();
  });

  it("accepts typed input", async () => {
    render(<Input label="Search" />);
    await userEvent.type(screen.getByLabelText("Search"), "keyboard");
    expect(screen.getByLabelText("Search")).toHaveValue("keyboard");
  });
});
