import { describe, expect, it } from "vitest";
import {
  dateOnlyInBogota,
  monthStartDateInBogota,
  startOfMonthInBogota,
} from "./Date";

describe("Colombia date helpers", () => {
  it("formats calendar dates in America/Bogota", () => {
    expect(dateOnlyInBogota(new Date("2026-11-20T02:30:00.000Z"))).toBe(
      "2026-11-19",
    );
  });

  it("starts the month in the configured calendar month", () => {
    const start = startOfMonthInBogota(new Date("2026-11-20T02:30:00.000Z"));
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(10);
    expect(start.getDate()).toBe(1);
  });

  it("calculates month starts from the Bogota date across a UTC month boundary", () => {
    const instant = new Date("2026-03-01T04:30:00.000Z");
    expect(dateOnlyInBogota(instant)).toBe("2026-02-28");
    expect(monthStartDateInBogota(instant)).toBe("2026-02-01");
    expect(monthStartDateInBogota(instant, -2)).toBe("2025-12-01");
  });

});
