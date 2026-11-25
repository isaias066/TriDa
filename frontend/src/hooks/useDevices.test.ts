import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDevices } from "./useDevices";

const mocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  delete: vi.fn(),
  showToast: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@/api/Devices", () => ({
  DevicesApi: {
    getAll: mocks.getAll,
    delete: mocks.delete,
  },
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id_usuario: 1 }, logout: mocks.logout }),
}));

vi.mock("@/utils/deviceRegistration", () => ({
  clearCurrentDeviceRecordId: vi.fn(),
}));

afterEach(cleanup);

beforeEach(() => {
  mocks.getAll.mockReset();
  mocks.delete.mockReset();
  mocks.showToast.mockReset();
  mocks.logout.mockReset();
  mocks.getAll.mockResolvedValue([]);
});

describe("useDevices", () => {
  it("logs out locally after the server revokes all sessions on device deletion", async () => {
    mocks.delete.mockResolvedValue({});
    const { result } = renderHook(() => useDevices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.removeDevice(7)).resolves.toBe(true);
    });

    expect(mocks.delete).toHaveBeenCalledWith(7);
    expect(mocks.logout).toHaveBeenCalledWith(true);
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Dispositivo eliminado",
        message: expect.stringContaining("todas las sesiones se cerraron"),
      }),
    );
  });
});
