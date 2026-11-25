import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

const mocks = vi.hoisted(() => ({
  getPendingCount: vi.fn(),
  selectedAccountId: null as number | null,
}));

vi.mock("@/api/Alerts", () => ({
  AlertsApi: {
    getPendingCount: mocks.getPendingCount,
  },
}));

vi.mock("@/hooks/useAccount", () => ({
  useAccount: () => ({ selectedAccountId: mocks.selectedAccountId }),
}));

vi.mock("./SidebarBrand", () => ({ SidebarBrand: () => null }));
vi.mock("./SidebarAccountSelector", () => ({
  SidebarAccountSelector: () => null,
}));
vi.mock("./SidebarNav", () => ({
  SidebarNav: ({ pendingAlertsCount }: { pendingAlertsCount: number }) =>
    createElement("span", { "data-testid": "pending-count" }, pendingAlertsCount),
}));
vi.mock("./SidebarUserProfile", () => ({ SidebarUserProfile: () => null }));

afterEach(cleanup);

beforeEach(() => {
  mocks.getPendingCount.mockReset();
  mocks.selectedAccountId = null;
});

describe("Sidebar", () => {
  it("uses the selected account for its alert count and refresh events", async () => {
    mocks.getPendingCount
      .mockResolvedValueOnce({ count: 5 })
      .mockResolvedValueOnce({ count: 2 })
      .mockResolvedValueOnce({ count: 3 });

    const props = { isOpenMobile: false, onCloseMobile: vi.fn() };
    const { rerender } = render(
      createElement(
        MemoryRouter,
        null,
        createElement(Sidebar, props),
      ),
    );

    await waitFor(() => {
      expect(mocks.getPendingCount).toHaveBeenNthCalledWith(1, undefined);
      expect(screen.getByTestId("pending-count").textContent).toBe("5");
    });

    mocks.selectedAccountId = 12;
    rerender(
      createElement(
        MemoryRouter,
        null,
        createElement(Sidebar, props),
      ),
    );
    await waitFor(() => {
      expect(mocks.getPendingCount).toHaveBeenNthCalledWith(2, 12);
      expect(screen.getByTestId("pending-count").textContent).toBe("2");
    });

    window.dispatchEvent(new Event("trida-alerts-updated"));
    await waitFor(() => {
      expect(mocks.getPendingCount).toHaveBeenNthCalledWith(3, 12);
      expect(screen.getByTestId("pending-count").textContent).toBe("3");
    });
  });
});
