import { describe, expect, it } from "vitest";
import { formatCurrency } from "./Formatters";

describe("formatCurrency", () => {
  it("formats COP without decimal fractions", () => {
    expect(formatCurrency(1250.5)).toBe("$ 1.251");
  });

  it("formats invalid COP values as zero", () => {
    expect(formatCurrency("invalid")).toBe("$ 0");
  });

  it("preserves two decimal fractions for USD", () => {
    expect(formatCurrency(1250.5, "USD", "en-US")).toBe("$1,250.50");
  });
});
