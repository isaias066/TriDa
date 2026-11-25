import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBudgets } from "./useBudgets";

const mocks = vi.hoisted(() => ({
  getBudgets: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/api/Budgets", () => ({
  budgetsApi: {
    getBudgets: mocks.getBudgets,
  },
}));

vi.mock("@/hooks/useAccount", () => ({
  useAccount: () => ({
    selectedAccount: { id_cuenta: 5 },
  }),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));

afterEach(() => {
  cleanup();
  mocks.getBudgets.mockReset();
});

describe("useBudgets", () => {
  it("refreshes spending totals when a transaction changes", async () => {
    mocks.getBudgets.mockResolvedValue([]);
    renderHook(() => useBudgets());

    await waitFor(() => expect(mocks.getBudgets).toHaveBeenCalledTimes(1));
    act(() => {
      window.dispatchEvent(new Event("trida-transactions-updated"));
    });

    await waitFor(() => expect(mocks.getBudgets).toHaveBeenCalledTimes(2));
  });
});
