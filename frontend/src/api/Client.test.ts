import { describe, expect, it } from "vitest";
import { normalizeApiError } from "./Client";

describe("normalizeApiError", () => {
  it("includes the HTTP status and backend error code", () => {
    const error = normalizeApiError({
      response: {
        status: 403,
        data: {
          success: false,
          error: {
            code: "USER_INACTIVE",
            message: "La cuenta está inactiva.",
          },
        },
      },
    });

    expect(error.message).toBe(
      "[HTTP 403 · USER_INACTIVE] La cuenta está inactiva.",
    );
  });

  it("includes the HTTP status and backend code for server errors", () => {
    const error = normalizeApiError({
      response: {
        status: 500,
        data: {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Ocurrió un error interno.",
          },
        },
      },
    });

    expect(error.message).toBe(
      "[HTTP 500 · INTERNAL_SERVER_ERROR] Ocurrió un error interno.",
    );
  });

  it("explains that a network error has no HTTP status", () => {
    const error = normalizeApiError({
      code: "ERR_NETWORK",
      message: "Network Error",
    });

    expect(error.message).toContain("Sin respuesta HTTP");
    expect(error.message).toContain("backend esté iniciado");
  });
});
