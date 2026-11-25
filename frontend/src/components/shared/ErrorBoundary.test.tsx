import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

const BrokenComponent = (): never => {
  throw new Error("render failed");
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("shows a recovery action when a child throws during render", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Algo salió mal" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Recargar aplicación" }),
    ).toBeTruthy();
    expect(errorLog).toHaveBeenCalledWith(
      "ErrorBoundary caught a render error",
      { errorName: "Error" },
    );
  });
});
