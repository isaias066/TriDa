import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAlerts } from "./useAlerts";

const mocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  getPendingCount: vi.fn(),
  updateStatus: vi.fn(),
  showToast: vi.fn(),
  refreshAccounts: vi.fn(),
}));

vi.mock("@/hooks/useAccount", () => ({
  useAccount: () => ({ refreshAccounts: mocks.refreshAccounts }),
}));

vi.mock("@/api/Alerts", () => ({
  AlertsApi: {
    getAll: mocks.getAll,
    getPendingCount: mocks.getPendingCount,
    updateStatus: mocks.updateStatus,
  },
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));

afterEach(() => {
  cleanup();
});

describe("useAlerts", () => {
  beforeEach(() => {
    mocks.getAll.mockReset();
    mocks.getAll.mockResolvedValue({
      items: [],
      pagination: { total: 0, limit: 15, offset: 0 },
    });
    mocks.getPendingCount.mockReset();
    mocks.updateStatus.mockReset();
    mocks.showToast.mockReset();
    mocks.refreshAccounts.mockReset();
    mocks.refreshAccounts.mockResolvedValue(undefined);
  });

  it("ignores an older pending-count response after a newer request", async () => {
    const pendingCountResolvers: Array<(response: { count: number }) => void> =
      [];
    mocks.getPendingCount.mockImplementation(
      () =>
        new Promise<{ count: number }>((resolve) => {
          pendingCountResolvers.push(resolve);
        }),
    );
    mocks.updateStatus.mockResolvedValue({});

    const { result } = renderHook(() => useAlerts());
    await waitFor(() => {
      expect(pendingCountResolvers.length).toBeGreaterThan(0);
    });
    const initialRequestCount = pendingCountResolvers.length;

    await act(async () => {
      await result.current.resolveAlert(1, "FUI_YO");
    });
    expect(mocks.refreshAccounts).toHaveBeenCalled();
    await waitFor(() => {
      expect(pendingCountResolvers.length).toBeGreaterThan(initialRequestCount);
    });
    const latestRequestIndex = pendingCountResolvers.length - 1;

    await act(async () => {
      pendingCountResolvers[latestRequestIndex]({ count: 2 });
    });
    await waitFor(() => {
      expect(result.current.pendingCount).toBe(2);
    });

    await act(async () => {
      for (let index = 0; index < initialRequestCount; index += 1) {
        pendingCountResolvers[index]({ count: 1 });
      }
    });
    expect(result.current.pendingCount).toBe(2);
  });
});
