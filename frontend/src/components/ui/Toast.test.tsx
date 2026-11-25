import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./Toast";

const ToastTrigger = () => {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        showToast({ type: "success", title: "Guardado correctamente" })
      }
    >
      Mostrar toast
    </button>
  );
};

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("clears a toast timer when the toast is dismissed", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mostrar toast" }));
    expect(vi.getTimerCount()).toBe(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Cerrar notificación" }),
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears outstanding toast timers when the provider unmounts", () => {
    const { unmount } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mostrar toast" }));
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not rerender context consumers when only the toast list changes", () => {
    let consumerRenders = 0;
    const Consumer = () => {
      useToast();
      consumerRenders += 1;
      return null;
    };

    render(
      <ToastProvider>
        <Consumer />
        <ToastTrigger />
      </ToastProvider>,
    );
    expect(consumerRenders).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "Mostrar toast" }));
    expect(consumerRenders).toBe(1);
  });
});
