import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

afterEach(cleanup);

describe("PasswordStrengthMeter", () => {
  it("reports valid only at the 72-character maximum", () => {
    const { rerender } = render(
      <PasswordStrengthMeter password={`A!${"a".repeat(70)}`} />,
    );

    expect(screen.getByText("Válida")).toBeTruthy();
    expect(screen.getByText("Mínimo 12 caracteres")).toBeTruthy();
    expect(screen.getByText("Máximo 72 caracteres")).toBeTruthy();
    expect(screen.getByText("Al menos una mayúscula (A-Z)")).toBeTruthy();
    expect(screen.getByText("Al menos una minúscula (a-z)")).toBeTruthy();
    expect(screen.getByText("Al menos un carácter especial")).toBeTruthy();

    rerender(<PasswordStrengthMeter password={`A!${"a".repeat(71)}`} />);

    expect(screen.queryByText("Válida")).toBeNull();
    expect(screen.getByText("Casi lista")).toBeTruthy();
  });
});
