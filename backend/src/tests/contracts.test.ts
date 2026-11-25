import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@prisma/client";
import SwaggerParser from "@apidevtools/swagger-parser";
import type { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { swaggerSpec } from "../config/swagger.js";
import { createAccountSchema, updateAccountSchema } from "../modules/account/accounts.schemas.js";
import {
  createTransactionSchema,
  emailTransactionConfirmationSchema,
  externalTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionCategorySchema,
  updateTransactionStatusSchema,
} from "../modules/transactions/transactions.schemas.js";
import { getTransactionBalanceDelta } from "../modules/transactions/transaction-balance.js";
import {
  createTransactionConfirmationToken,
  TRANSACTION_CONFIRMATION_TTL_SECONDS,
  verifyTransactionConfirmationToken,
} from "../modules/transactions/transaction-confirmation-token.js";
import {
  buildTransactionArchiveCsv,
  fingerprintExternalEvent,
} from "../modules/transactions/transaction-archive.js";
import { queryRaw } from "../db/queryRaw.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../modules/auth/auth.schemas.js";
import { budgetQuerySchema, createBudgetSchema } from "../modules/budgets/budgets.schemas.js";
import {
  alertIdSchema,
  listAlertsQuerySchema,
  updateAlertStatusSchema,
} from "../modules/alerts/alerts.schemas.js";
import { getAlertTransactionDecision } from "../modules/alerts/alerts.service.js";
import { getUnifiedRiskLevel } from "../utils/risk.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../modules/categories/category.schemas.js";
import { AUDIT_RETENTION_DAYS } from "../modules/auth/auth.service.js";
import { getAuthenticatedUserKey, getEmailKey } from "../middlewares/rateLimit.middleware.js";
import { config } from "../config.js";
import {
  MIN_HISTORICAL_TRANSACTIONS_FOR_AVERAGE,
  getGeoRiskPenalty,
  RiskService,
} from "../modules/alerts/risk.service.js";
import { registerDeviceSchema, updateTrustSchema } from "../modules/devices/devices.schemas.js";
import { errorHandler, isPrismaKnownRequestError } from "../middlewares/error.middleware.js";
import { requestLogger } from "../middlewares/requestLogger.middleware.js";
import {
  addFundsSchema,
  createSavingsSchema,
  savingsIdSchema,
  updateSavingsSchema,
} from "../modules/savings/savings.schemas.js";
import { deriveSavingsState } from "../modules/savings/savings.state.js";
import { parseId } from "../utils/params.js";
import { reportQuerySchema } from "../modules/reports/reports.schemas.js";
import { mapQuerySchema } from "../modules/maps/maps.schemas.js";
import { dashboardStatsQuerySchema } from "../modules/dashboard/dashboard.schemas.js";
import { auditHistoryQuerySchema } from "../modules/audit/audit.schemas.js";
import {
  calculateNetBalance,
  calculatePercentage,
  exceedsAverageMultiple,
} from "../utils/decimal-money.js";
import { getRiskLevel, riskLevelSql, riskRankSql } from "../utils/risk.js";
import {
  parseDateEnd,
  parseDateStart,
  startOfMonth,
  startOfNextMonth,
} from "../utils/dateRange.js";
import {
  createPasswordResetToken,
  getUnverifiedPasswordResetUserId,
  PASSWORD_RESET_TOKEN_TTL_SECONDS,
  verifyPasswordResetToken,
} from "../modules/auth/reset-token.js";
import {
  createEmailVerificationToken,
  EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
  getUnverifiedEmailVerificationUserId,
  verifyEmailVerificationToken,
} from "../modules/auth/email-verification.js";
import { Logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

test("request logger returns a request ID and logs safe completion metadata", () => {
  const originalInfo = console.info;
  const loggedLines: string[] = [];
  const headers = new Map<string, string>();
  let finishListener: (() => void) | undefined;
  const request = {
    method: "GET",
    path: "/api/v2/accounts/123",
    baseUrl: "/api/v2/accounts",
    route: { path: "/:id" },
    originalUrl: "/api/v2/accounts/123?token=must-not-be-logged",
  } as Request;
  const response = {
    locals: {},
    statusCode: 200,
    setHeader: (name: string, value: string) => {
      headers.set(name, value);
      return response;
    },
    once: (event: string, listener: () => void) => {
      assert.equal(event, "finish");
      finishListener = listener;
      return response;
    },
  } as unknown as Response;

  console.info = (line?: unknown) => {
    loggedLines.push(String(line));
  };

  try {
    requestLogger(request, response, () => undefined);
    const requestId = headers.get("X-Request-Id");
    assert.match(
      requestId ?? "",
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    assert.equal(response.locals.requestId, requestId);

    finishListener?.();

    const logRecord = JSON.parse(loggedLines[0] ?? "{}") as Record<string, unknown>;
    const context = logRecord.context as Record<string, unknown>;
    assert.equal(logRecord.event, "http.request.completed");
    assert.equal(logRecord.service, "trida-backend");
    assert.equal(context.requestId, requestId);
    assert.equal(context.method, "GET");
    assert.equal(context.path, "/api/v2/accounts/:id");
    assert.equal(context.statusCode, 200);
    assert.equal("token" in context, false);
    assert.equal(loggedLines[0]?.includes("must-not-be-logged"), false);
  } finally {
    console.info = originalInfo;
  }
});

test("structured logger includes child context without leaking error messages or stacks", () => {
  const originalError = console.error;
  const loggedLines: string[] = [];
  console.error = (line?: unknown) => {
    loggedLines.push(String(line));
  };

  try {
    const logger = new Logger({
      service: "test-service",
      minLevel: "debug",
      baseContext: { environment: "test" },
    }).child({ requestId: "request-123" });
    logger.error("request.failed", new Error("sensitive exception detail"));

    const logRecord = JSON.parse(loggedLines[0] ?? "{}") as Record<string, unknown>;
    const context = logRecord.context as Record<string, unknown>;
    const error = logRecord.error as Record<string, unknown>;
    assert.equal(logRecord.level, "error");
    assert.equal(logRecord.service, "test-service");
    assert.equal(logRecord.event, "request.failed");
    assert.equal(context.environment, "test");
    assert.equal(context.requestId, "request-123");
    assert.equal(error.name, "Error");
    assert.equal("message" in error, false);
    assert.equal("stack" in error, false);
    assert.equal(loggedLines[0]?.includes("sensitive exception detail"), false);
  } finally {
    console.error = originalError;
  }
});

test("risk thresholds classify boundary scores consistently in TypeScript and SQL", () => {
  const cases = [
    [29, "BAJO"],
    [30, "MEDIO"],
    [69, "MEDIO"],
    [70, "ALTO"],
    [94, "ALTO"],
    [95, "CRITICO"],
  ] as const;

  for (const [score, expected] of cases) {
    assert.equal(getRiskLevel(score), expected);
  }

  assert.match(riskLevelSql("score_anomalia"), /score_anomalia >= 95 THEN 'CRITICO'/);
  assert.match(riskRankSql("score_anomalia"), /score_anomalia >= 70 THEN 3/);
});

test("risk level uses the highest of score and alert severity", () => {
  assert.equal(getUnifiedRiskLevel(40, "ALTA"), "ALTO");
  assert.equal(getUnifiedRiskLevel(80, "MEDIA"), "ALTO");
  assert.equal(getUnifiedRiskLevel(20, "CRITICA"), "CRITICO");
  assert.equal(getUnifiedRiskLevel(20, null), "BAJO");
});

test("impossible geolocation speed requires more than 100 km", () => {
  assert.equal(getGeoRiskPenalty(0.5, 900), null);
  assert.equal(getGeoRiskPenalty(100, 900), null);
  assert.deepEqual(getGeoRiskPenalty(100.1, 900), {
    score: 50,
    reason: "Velocidad de desplazamiento imposible: 900 km/h (100.1 km)",
  });
  assert.equal(getGeoRiskPenalty(100.1, 150), null);
  assert.deepEqual(getGeoRiskPenalty(100.1, 250), {
    score: 30,
    reason: "Desplazamiento inusualmente rápido: 250 km/h",
  });
});

test("audit history query is bounded and documented as a read-only self endpoint", () => {
  assert.deepEqual(auditHistoryQuerySchema.parse({}), { limit: 20 });
  assert.equal(auditHistoryQuerySchema.safeParse({ limit: 51 }).success, false);
  assert.equal(auditHistoryQuerySchema.safeParse({ before_id: 0 }).success, false);

  const paths = Reflect.get(swaggerSpec, "paths");
  assert.ok(paths && typeof paths === "object");
  const auditPath = Reflect.get(paths, "/api/v2/audit");
  assert.ok(auditPath && typeof auditPath === "object");
  const getOperation = Reflect.get(auditPath, "get");
  assert.ok(getOperation && typeof getOperation === "object");
  assert.match(
    String(Reflect.get(getOperation, "summary") ?? ""),
    /historial de seguridad propio/i,
  );
});

test("financial calculations preserve decimal cents and threshold boundaries", () => {
  assert.equal(calculateNetBalance("0.30", "0.10", "0.05").toString(), "0.15");
  assert.equal(
    calculateNetBalance("999999999999.99", "999999999999.98", "0.01").toFixed(2),
    "0.00",
  );
  assert.equal(calculatePercentage("0.10", "0.30").toFixed(2), "33.33");
  assert.equal(calculatePercentage("1.00", "0.00").toString(), "0");
  assert.equal(exceedsAverageMultiple("0.30", "0.10", 3), false);
  assert.equal(exceedsAverageMultiple("0.31", "0.10", 3), true);
});

test("rate limit keys separate users and login emails", () => {
  const tokenFor = (idUsuario: number) => jwt.sign({ id_usuario: idUsuario }, config.JWT_SECRET);

  const requestFor = (authorization?: string, email?: string) =>
    ({
      ip: "203.0.113.10",
      headers: authorization ? { authorization } : {},
      body: email ? { email } : {},
    }) as unknown as Parameters<typeof getAuthenticatedUserKey>[0];

  assert.equal(getAuthenticatedUserKey(requestFor(`Bearer ${tokenFor(1)}`)), "user:1");
  assert.equal(getAuthenticatedUserKey(requestFor(`Bearer ${tokenFor(2)}`)), "user:2");
  assert.notEqual(
    getEmailKey(requestFor(undefined, "Ana@Example.com")),
    getEmailKey(requestFor(undefined, "Otro@Example.com")),
  );
  assert.equal(
    getEmailKey(requestFor(undefined, "ANA@example.com")),
    getEmailKey(requestFor(undefined, "ana@example.com")),
  );
});

const withOfflineIa = async (fn: () => Promise<void>) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error("IA offline in unit test");
  }) as typeof fetch;
  try {
    await fn();
  } finally {
    globalThis.fetch = originalFetch;
  }
};

test("risk amount comparison requires at least ten historical transactions", async () => {
  await withOfflineIa(async () => {
  assert.equal(MIN_HISTORICAL_TRANSACTIONS_FOR_AVERAGE, 10);

  const riskService = new RiskService();
  const evaluate = async (countTx: number) =>
    riskService.evaluateRisk(
      {
        id_usuario: 1,
        monto: 100,
        tipo_movimiento: "INGRESO",
        fecha_transaccion: new Date("2026-11-21T12:00:00.000Z"),
      },
      {
        transaccion: {
          aggregate: async () => ({
            _avg: { monto: new Prisma.Decimal(10) },
            _count: { id_transaccion: countTx },
          }),
          count: async () => 0,
        },
      } as unknown as Prisma.TransactionClient,
    );

  assert.equal((await evaluate(9)).score_riesgo, 0);
  assert.equal((await evaluate(10)).score_riesgo, 40);
  });
});

test("risk evaluation flags the third expense in ten minutes, including pending ones", async () => {
  await withOfflineIa(async () => {
  let countQuery: unknown;
  const riskService = new RiskService();
  const result = await riskService.evaluateRisk(
    {
      id_usuario: 1,
      monto: 10,
      tipo_movimiento: "GASTO",
      fecha_transaccion: new Date("2026-11-21T12:00:00.000Z"),
    },
    {
      transaccion: {
        aggregate: async () => ({
          _avg: { monto: null },
          _count: { id_transaccion: 0 },
        }),
        count: async (args: Parameters<Prisma.TransactionClient["transaccion"]["count"]>[0]) => {
          countQuery = args;
          return 2;
        },
      },
    } as unknown as Prisma.TransactionClient,
  );

  assert.deepEqual(countQuery, {
    where: {
      id_usuario: 1,
      tipo_movimiento: "GASTO",
      estado: { in: ["PENDIENTE", "CONFIRMADA", "APROBADA"] },
      fecha_transaccion: {
        gte: new Date("2026-11-21T11:50:00.000Z"),
        lt: new Date("2026-11-21T12:00:00.000Z"),
      },
    },
  });
  assert.equal(result.score_riesgo, 30);
  assert.equal(result.nivel_riesgo, "MEDIO");
  assert.equal(result.estado_evaluacion, "REVISAR");
  assert.match(result.razones[0], /Ráfaga de gastos/);
  });
});

test("application errors carry stable module and domain codes", () => {
  const error = new AppError("Cuenta no encontrada", 404, "ACCOUNT_NOT_FOUND");
  assert.equal(error.statusCode, 404);
  assert.equal(error.code, "ACCOUNT_NOT_FOUND");
  assert.equal(error.message, "Cuenta no encontrada");
});

test("error handler returns the standard envelope with a domain code", () => {
  const result = runErrorHandler(
    new AppError("Consejo financiero no encontrado", 404, "DASHBOARD_ADVICE_NOT_FOUND"),
  );

  assert.equal(result.statusCode, 404);
  assert.deepEqual(result.body, {
    success: false,
    error: {
      code: "DASHBOARD_ADVICE_NOT_FOUND",
      message: "Consejo financiero no encontrado",
    },
  });
});

test("error handler does not expose unexpected internal error messages", () => {
  const originalError = console.error;
  console.error = () => undefined;

  try {
    const result = runErrorHandler(new Error("database credentials leaked"));

    assert.equal(result.statusCode, 500);
    assert.deepEqual(result.body, {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error interno en el servidor.",
      },
    });
  } finally {
    console.error = originalError;
  }
});

function runErrorHandler(error: unknown) {
  const result: { statusCode: number; body: unknown } = {
    statusCode: 200,
    body: undefined,
  };
  const response = {
    locals: { requestId: "test-request" },
    status(statusCode: number) {
      result.statusCode = statusCode;
      return response;
    },
    json(body: unknown) {
      result.body = body;
      return response;
    },
  } as unknown as Response;

  errorHandler(
    error,
    { method: "GET", path: "/api/v2/test" } as Request,
    response,
    () => undefined,
  );

  return result;
}

test("account schema accepts the documented snake_case contract only", () => {
  const documented = createAccountSchema.parse({
    nombre: "Cuenta principal",
    entidad: "Banco de Bogotá",
    tipo: "BANCO",
    numero_enmascarado: "1234",
    saldo_inicial: 250,
  });
  assert.equal(documented.numero_enmascarado, "1234");
  assert.equal(documented.saldo_inicial, 250);
  assert.equal(
    createAccountSchema.parse({
      nombre: "Efectivo",
      tipo: "EFECTIVO",
    }).numero_enmascarado,
    undefined,
  );
  assert.equal(
    createAccountSchema.safeParse({
      nombre: "Cuenta sin entidad",
      tipo: "BANCO",
      numero_enmascarado: "1234",
    }).success,
    false,
  );
  assert.equal(
    createAccountSchema.safeParse({
      nombre: "Cuenta",
      entidad: "Banco",
      tipo: "BANCO",
      numero_enmascarado: "123456789",
    }).success,
    false,
  );
  assert.equal(
    createAccountSchema.safeParse({
      nombre: "Cuenta",
      entidad: "Banco",
      tipo: "BANCO",
      numero_enmascarado: "1234",
      color: "red",
    }).success,
    false,
  );
  assert.equal(
    createAccountSchema.safeParse({
      nombre: "Cuenta secundaria",
      tipo: "EFECTIVO",
      numeroEnmascarado: "1234",
    }).success,
    false,
  );
  assert.equal(
    createAccountSchema.safeParse({ nombre: "Cuenta", tipo: "BANCO", saldo_inicial: -1 }).success,
    false,
  );
  assert.equal(updateAccountSchema.safeParse({}).success, false);
  assert.equal(
    updateAccountSchema.safeParse({ nombre: "Cuenta principal", saldo_inicial: 500 }).success,
    false,
  );
  const accountUpdatePaths = swaggerSpec as {
    paths?: Record<
      string,
      {
        patch?: {
          requestBody?: {
            content?: Record<string, { schema?: { properties?: Record<string, unknown> } }>;
          };
        };
      }
    >;
  };
  const accountUpdate = accountUpdatePaths.paths?.["/api/v2/accounts/{id}"]?.patch;
  assert.equal(
    accountUpdate?.requestBody?.content?.["application/json"]?.schema?.properties?.saldo_inicial,
    undefined,
  );
});

test("transaction schema accepts snake_case and rejects camelCase aliases", () => {
  const transaction = createTransactionSchema.parse({
    id_cuenta: "5",
    monto: "30.5",
    tipo_movimiento: "GASTO",
  });

  assert.equal(transaction.id_cuenta, 5);
  assert.equal(transaction.monto, 30.5);
  assert.equal(
    createTransactionSchema.parse({
      id_cuenta: 5,
      monto: "1.239",
      tipo_movimiento: "GASTO",
    }).monto,
    1.24,
  );
  assert.equal(
    createTransactionSchema.safeParse({
      accountId: "5",
      monto: "30.5",
      tipo_movimiento: "GASTO",
    }).success,
    false,
  );
  assert.equal(listTransactionsQuerySchema.safeParse({ limit: "101" }).success, false);
  assert.equal(
    createTransactionSchema.safeParse({
      id_cuenta: 5,
      monto: -1,
      tipo_movimiento: "GASTO",
    }).success,
    false,
  );
  assert.equal(
    createTransactionSchema.safeParse({
      id_cuenta: 5,
      monto: 10,
      tipo_movimiento: "GASTO",
      fecha_transaccion: "2099-01-01T00:00:00.000Z",
    }).success,
    false,
  );
  assert.equal(
    createTransactionSchema.safeParse({
      id_cuenta: 5,
      monto: 10,
      tipo_movimiento: "GASTO",
      ip_origen: "not-an-ip",
    }).success,
    false,
  );
  assert.equal(
    createTransactionSchema.safeParse({
      id_cuenta: 5,
      id_cuenta_destino: 6,
      monto: 10,
      tipo_movimiento: "TRANSFERENCIA",
    }).success,
    false,
  );
});

test("external movements require idempotency keys and valid transfer accounts", () => {
  const gasto = externalTransactionSchema.parse({
    fuente: "SIMULADOR",
    id_evento: "evt-123",
    id_cuenta: 5,
    monto: "30.50",
    tipo_movimiento: "GASTO",
  });
  assert.equal(gasto.fuente, "SIMULADOR");
  assert.equal(gasto.monto, 30.5);

  assert.equal(
    externalTransactionSchema.safeParse({
      fuente: "SIMULADOR",
      id_evento: "evt-124",
      id_cuenta: 5,
      monto: 30,
      tipo_movimiento: "TRANSFERENCIA",
    }).success,
    false,
  );
  assert.equal(
    externalTransactionSchema.safeParse({
      fuente: "SIMULADOR",
      id_evento: "evt-125",
      id_cuenta: 5,
      id_cuenta_destino: 5,
      monto: 30,
      tipo_movimiento: "TRANSFERENCIA",
    }).success,
    false,
  );
  assert.equal(
    externalTransactionSchema.safeParse({
      fuente: "SIMULADOR",
      id_evento: "evt-126",
      id_cuenta: 5,
      id_cuenta_destino: 6,
      monto: 30,
      tipo_movimiento: "GASTO",
    }).success,
    false,
  );
  assert.equal(
    externalTransactionSchema.safeParse({
      fuente: "SIMULADOR",
      id_cuenta: 5,
      monto: 30,
      tipo_movimiento: "INGRESO",
    }).success,
    false,
  );
  assert.equal(updateTransactionCategorySchema.safeParse({ id_categoria: null }).success, true);
  assert.equal(
    emailTransactionConfirmationSchema.safeParse({
      token: "token",
      decision: "NO_FUI_YO",
    }).success,
    true,
  );
  assert.equal(
    createTransactionSchema.safeParse({
      id_cuenta: 5,
      monto: 10,
      tipo_movimiento: "GASTO",
      ip_origen: "::1",
    }).success,
    false,
  );
});

test("annual transaction exports preserve CSV values and external event fingerprints", () => {
  const event = externalTransactionSchema.parse({
    fuente: "SIMULADOR",
    id_evento: "evt-archive-1",
    id_cuenta: 5,
    monto: "30.50",
    tipo_movimiento: "GASTO",
    comercio: "Comercio",
  });
  assert.equal(fingerprintExternalEvent(event), fingerprintExternalEvent(event));
  assert.notEqual(
    fingerprintExternalEvent(event),
    fingerprintExternalEvent({ ...event, monto: 31 }),
  );

  const csv = buildTransactionArchiveCsv([
    {
      id_transaccion: 42,
      id_cuenta: 5,
      nombre_cuenta: "Cuenta principal",
      id_cuenta_destino: null,
      nombre_cuenta_destino: null,
      fecha_transaccion: new Date("2024-01-01T00:00:00.000Z"),
      tipo_movimiento: "GASTO",
      monto: new Prisma.Decimal("30.50"),
      moneda: "COP",
      comercio: '=HYPERLINK("https://example.test","click")',
      descripcion: "Compra, tienda",
      canal: "webhook",
      estado: "CONFIRMADA",
      id_categoria: null,
      nombre_categoria: null,
      score_anomalia: null,
      fuente_externa: "SIMULADOR",
      id_evento_externo: "evt-archive-1",
      alertas: [],
    },
  ]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'=HYPERLINK(""https://example.test"",""click"")"'));
  assert.ok(csv.includes('"Compra, tienda"'));
});

test("failed login audit uses 90-day retention", () => {
  assert.equal(AUDIT_RETENTION_DAYS, 90);
});

test("inactive categories can be reactivated through state update", () => {
  assert.equal(
    createCategorySchema.parse({ nombre: "Comida", tipo: "GASTO" }).color,
    "#8B5CF6",
  );
  assert.equal(
    createCategorySchema.safeParse({
      nombre: "Comida",
      tipo: "GASTO",
      icono: "utensils",
    }).success,
    false,
  );
  assert.equal(updateCategorySchema.safeParse({ estado: true }).success, true);
  assert.equal(updateCategorySchema.safeParse({ estado: false }).success, true);
  assert.equal(updateCategorySchema.safeParse({ estado: "true" }).success, false);
});

test("route IDs and monetary values are bounded and normalized", () => {
  assert.equal(parseId("12"), 12);
  assert.throws(() => parseId("abc"));
  assert.throws(() => parseId("0"));
  assert.throws(
    () => parseId("2147483648"),
    (error: unknown) =>
      error instanceof AppError && error.statusCode === 404 && error.code === "NOT_FOUND",
  );
  assert.equal(addFundsSchema.safeParse({ monto: "1002.345" }).data?.monto, 1002.35);
  assert.equal(addFundsSchema.safeParse({ monto: "1001.005" }).data?.monto, 1001.01);
  assert.equal(addFundsSchema.safeParse({ monto: "999.99" }).success, false);
  const maximumAmount = addFundsSchema.safeParse({ monto: "9999999999999.99" });
  assert.equal(maximumAmount.success, true);
  if (maximumAmount.success) {
    assert.equal(new Prisma.Decimal(maximumAmount.data.monto).toFixed(2), "9999999999999.99");
  }
  assert.equal(
    addFundsSchema.safeParse({ monto: "9999999999999.994" }).data?.monto,
    9999999999999.99,
  );
  assert.equal(addFundsSchema.safeParse({ monto: "9999999999999.995" }).success, false);
  assert.equal(
    createAccountSchema.safeParse({
      nombre: "Cuenta centavos",
      tipo: "EFECTIVO",
      saldo_inicial: "1.005",
    }).data?.saldo_inicial,
    1.01,
  );
  assert.equal(
    createAccountSchema.safeParse({
      nombre: "Cuenta negativa",
      tipo: "EFECTIVO",
      saldo_inicial: "-0.01",
    }).success,
    false,
  );
  assert.equal(addFundsSchema.safeParse({ monto: "10000000000000" }).success, false);
  assert.equal(
    createBudgetSchema.safeParse({
      id_categoria: 1,
      limite_mensual: "10000000000000",
      mes: 1,
      anio: 2026,
    }).success,
    false,
  );
  assert.equal(
    createSavingsSchema.safeParse({
      nombre: "Ahorro",
      monto_objetivo: 100,
      monto_actual: 100,
    }).success,
    true,
  );
  assert.equal(
    createSavingsSchema.safeParse({
      nombre: "Ahorro vencido",
      monto_objetivo: 100,
      fecha_limite: "2000-01-01",
    }).success,
    false,
  );
  assert.equal(
    createSavingsSchema.safeParse({
      nombre: "Ahorro futuro",
      monto_objetivo: 100,
      fecha_limite: "2099-12-31",
    }).success,
    true,
  );
  assert.equal(updateSavingsSchema.safeParse({ fecha_limite: null }).success, true);
});

test("calendar date filters use the configured timezone boundaries", () => {
  const timeZone = "America/Bogota";
  assert.equal(parseDateStart("2026-11-01", timeZone).toISOString(), "2026-11-01T05:00:00.000Z");
  assert.equal(parseDateEnd("2026-11-01", timeZone).toISOString(), "2026-11-02T04:59:59.999Z");
  const date = new Date("2026-11-18T12:00:00.000Z");
  assert.equal(startOfMonth(date, timeZone).toISOString(), "2026-11-01T05:00:00.000Z");
  assert.equal(startOfNextMonth(date, timeZone).toISOString(), "2026-12-01T05:00:00.000Z");
  assert.throws(() => parseDateStart("2026-02-30", timeZone), /Fecha de calendario inválida/);
});

test("documented transaction query parameters map to service filters", () => {
  const query = listTransactionsQuerySchema.parse({
    id_cuenta: "5",
    min_monto: "10",
    fecha_inicio: "2026-01-01",
    sort_by: "monto",
    sort_order: "asc",
    estado: "CONFIRMADA",
    search: "mercado",
  });

  assert.equal(query.id_cuenta, 5);
  assert.equal(query.fecha_inicio, "2026-01-01");
  assert.equal(query.min_monto, 10);
  assert.equal(query.sort_by, "monto");
  assert.equal(query.sort_order, "asc");
  assert.equal(query.estado, "CONFIRMADA");
  assert.deepEqual(budgetQuerySchema.parse({ id_cuenta: "5", mes: "2", anio: "2026" }), {
    id_cuenta: 5,
    mes: 2,
    anio: 2026,
  });
  assert.equal(reportQuerySchema.parse({ id_cuenta: "5" }).id_cuenta, 5);
  assert.equal(
    reportQuerySchema.safeParse({
      fecha_inicio: "2026-02-28",
      fecha_fin: "2026-02-01",
    }).success,
    false,
  );
  assert.equal(
    reportQuerySchema.safeParse({
      fecha_inicio: "2026-02-01",
      fecha_fin: "2026-02-28",
    }).success,
    true,
  );
  assert.equal(mapQuerySchema.parse({ id_cuenta: "5" }).id_cuenta, 5);
});

test("global account filters are documented for dashboard, reports, budgets and map", () => {
  const spec = swaggerSpec as {
    paths?: Record<string, { get?: { parameters?: Array<{ name: string }> } }>;
  };
  for (const path of [
    "/api/v2/dashboard/stats",
    "/api/v2/reports/summary",
    "/api/v2/reports/by-category",
    "/api/v2/reports/transactions",
    "/api/v2/budgets",
    "/api/v2/map/stats",
    "/api/v2/map/locations",
  ]) {
    const parameters = spec.paths?.[path]?.get?.parameters ?? [];
    assert.ok(
      parameters.some(({ name }) => name === "id_cuenta"),
      `${path} must expose id_cuenta`,
    );
  }
});

test("dashboard period accepts only the supported rolling ranges", () => {
  assert.equal(dashboardStatsQuerySchema.parse({}).periodo_dias, 30);
  for (const periodo_dias of [30, 90, 180, 365]) {
    assert.equal(dashboardStatsQuerySchema.parse({ periodo_dias }).periodo_dias, periodo_dias);
  }
  assert.equal(dashboardStatsQuerySchema.safeParse({ periodo_dias: 60 }).success, false);
});

test("pending transactions can only be resolved to a balance-affecting final state", () => {
  assert.equal(updateTransactionStatusSchema.safeParse({ estado: "CONFIRMADA" }).success, true);
  assert.equal(updateTransactionStatusSchema.safeParse({ estado: "RECHAZADA" }).success, true);
  assert.equal(updateTransactionStatusSchema.safeParse({ estado: "PENDIENTE" }).success, false);
  assert.equal(getTransactionBalanceDelta("INGRESO", 25).toString(), "25");
  assert.equal(getTransactionBalanceDelta("GASTO", 25).toString(), "-25");
  assert.equal(getTransactionBalanceDelta("AHORRO", 25).toString(), "-25");
  assert.equal(getTransactionBalanceDelta("TRANSFERENCIA", 25).toString(), "-25");
  assert.equal(getTransactionBalanceDelta("GASTO", "25.10").toFixed(2), "-25.10");
  assert.throws(() => getTransactionBalanceDelta("INVALIDO", 25), /Tipo de movimiento inválido/);
  assert.throws(
    () => queryRaw("SELECT $2", 1),
    /La consulta SQL no coincide con sus parámetros enlazados/,
  );
});

test("automatic transaction confirmation tokens are signed and expire after 15 minutes", () => {
  const secret = "a-secure-test-secret-that-is-at-least-32-characters";
  const token = createTransactionConfirmationToken({ id_usuario: 42, id_transaccion: 84 }, secret);
  const claims = jwt.decode(token);
  assert.equal(
    typeof claims === "object" && claims !== null ? claims.exp! - claims.iat! : null,
    TRANSACTION_CONFIRMATION_TTL_SECONDS,
  );
  assert.deepEqual(verifyTransactionConfirmationToken(token, secret), {
    id_usuario: 42,
    id_transaccion: 84,
  });
  assert.equal(verifyTransactionConfirmationToken(token, `${secret}-wrong`), null);
});

test("auth schemas align with the snake_case OpenAPI fields", () => {
  assert.equal(
    registerSchema.safeParse({
      nombre_completo: "Ana Pérez",
      email: "ana@email.com",
      password: "ClaveSegura1!",
    }).success,
    true,
  );
  assert.equal(
    registerSchema.parse({
      nombre_completo: "Ana Pérez",
      email: "  Ana@EMAIL.COM ",
      password: "ClaveSegura1!",
    }).email,
    "ana@email.com",
  );
  assert.equal(
    loginSchema.safeParse({ correo: "ana@email.com", password: "ClaveSegura1" }).success,
    false,
  );
  assert.deepEqual(updateProfileSchema.parse({ telefono: null }), {
    telefono: null,
  });
  assert.equal(updateProfileSchema.safeParse({ telefono: "" }).success, true);
  assert.equal(
    registerSchema.safeParse({
      nombre_completo: "Ana Pérez",
      email: "ana@email.com",
      password: "Abcdefg!12",
    }).success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({
      nombre_completo: "Ana Pérez",
      email: "ana@email.com",
      password: "Abcdefg!hijk",
    }).success,
    true,
  );
  assert.equal(
    registerSchema.safeParse({
      nombre_completo: "Ana Pérez",
      email: "ana@email.com",
      password: "SecurePass!word",
    }).success,
    true,
  );
  assert.equal(
    registerSchema.safeParse({
      nombre_completo: "Ana Pérez",
      email: "ana@email.com",
      password: "Abcdefghijkl",
    }).success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({
      nombre_completo: "Ana Pérez",
      email: "ana@email.com",
      password: "Abcdefg hijk",
    }).success,
    false,
  );
  const maximumLengthPassword = `A!${"a".repeat(70)}`;
  assert.equal(
    resetPasswordSchema.safeParse({
      token: "reset-token",
      password_nueva: maximumLengthPassword,
    }).success,
    true,
  );
  assert.equal(
    changePasswordSchema.safeParse({
      password_actual: "actual",
      password_nueva: `${maximumLengthPassword}a`,
    }).success,
    false,
  );

  type DocumentedProperty = {
    type?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  const spec = swaggerSpec as {
    components?: {
      schemas?: Record<string, { properties?: Record<string, DocumentedProperty> }>;
    };
    paths?: Record<string, { get?: { parameters?: Array<{ name: string }> } }>;
  };
  const schemas = spec.components?.schemas ?? {};
  assert.ok(schemas.RegisterRequest?.properties?.email);
  assert.equal(schemas.RegisterRequest?.properties?.correo, undefined);
  assert.ok(schemas.ResetPasswordRequest?.properties?.password_nueva);
  for (const passwordSchema of [
    schemas.RegisterRequest?.properties?.password,
    schemas.ResetPasswordRequest?.properties?.password_nueva,
    schemas.ChangePasswordRequest?.properties?.password_nueva,
  ]) {
    assert.ok(passwordSchema);
    assert.equal(passwordSchema.type, "string");
    assert.equal(passwordSchema.minLength, 12);
    assert.equal(passwordSchema.maxLength, 72);
    assert.equal(passwordSchema.pattern, "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\p{L}\\p{N}\\s])");
  }

  const transactionParameters =
    spec.paths?.["/api/v2/transactions"]?.get?.parameters?.map(({ name }) => name) ?? [];
  assert.ok(transactionParameters.includes("fecha_inicio"));
  assert.ok(transactionParameters.includes("sort_by"));
  assert.equal(transactionParameters.includes("startDate"), false);

  assert.ok(schemas.CreateBudgetRequest?.properties?.limite_mensual);
});

test("budget, alert and device payloads use database-aligned snake_case fields", () => {
  assert.equal(
    createBudgetSchema.safeParse({
      id_categoria: 2,
      limite_mensual: 500,
      mes: 6,
      anio: 2026,
    }).success,
    true,
  );
  assert.equal(
    createBudgetSchema.safeParse({
      id_categoria: 2,
      monto_limite: 500,
      mes: 6,
      anio: 2026,
    }).success,
    false,
  );
  assert.equal(listAlertsQuerySchema.parse({ severidad: "ALTA" }).severidad, "ALTA");
  assert.equal(alertIdSchema.parse("12"), 12);
  assert.equal(alertIdSchema.safeParse("no-es-un-id").success, false);
  assert.equal(
    updateAlertStatusSchema.safeParse({ estado: "DESCARTADA", accion_usuario: "FUI_YO" }).success,
    true,
  );
  assert.equal(
    updateAlertStatusSchema.safeParse({ estado: "CONFIRMADA", accion_usuario: "NO_FUI_YO" })
      .success,
    true,
  );
  assert.equal(
    updateAlertStatusSchema.safeParse({ estado: "CONFIRMADA", accion_usuario: "BLOQUEAR_TARJETA" })
      .success,
    true,
  );
  assert.equal(
    updateAlertStatusSchema.safeParse({ estado: "CONFIRMADA", accion_usuario: "FUI_YO" }).success,
    false,
  );
  assert.equal(
    updateAlertStatusSchema.safeParse({ estado: "PENDIENTE", accion_usuario: "FUI_YO" }).success,
    false,
  );
  assert.equal(updateAlertStatusSchema.safeParse({ estado: "CONFIRMADA" }).success, false);
  assert.deepEqual(
    getAlertTransactionDecision({
      estado: "DESCARTADA",
      accion_usuario: "FUI_YO",
    }),
    { confirmsTransaction: true, rejectsTransaction: false },
  );
  assert.deepEqual(
    getAlertTransactionDecision({
      estado: "CONFIRMADA",
      accion_usuario: "NO_FUI_YO",
    }),
    { confirmsTransaction: false, rejectsTransaction: true },
  );
  assert.deepEqual(
    getAlertTransactionDecision({
      estado: "CONFIRMADA",
      accion_usuario: "BLOQUEAR_TARJETA",
    }),
    { confirmsTransaction: false, rejectsTransaction: true },
  );
  assert.equal(
    registerDeviceSchema.safeParse({
      identificador_unico: "device-hash",
      tipo_dispositivo: "MOBILE",
    }).success,
    true,
  );
  assert.equal(updateTrustSchema.safeParse({ confiable: true }).success, true);
});

test("OpenAPI includes all previously undocumented auth and dashboard routes", () => {
  const paths =
    (
      swaggerSpec as {
        paths?: Record<string, { get?: unknown; patch?: unknown }>;
      }
    ).paths ?? {};

  assert.ok(paths["/api/v2/auth/forgot-password"]);
  assert.ok(paths["/api/v2/auth/verify-email"]);
  assert.ok(paths["/api/v2/auth/verify-reset-token"]);
  assert.ok(paths["/api/v2/auth/reset-password"]);
  assert.ok(paths["/api/v2/dashboard/estadisticas"]);
  assert.ok(paths["/api/v2/dashboard/advice"]?.get);
  assert.ok(paths["/api/v2/dashboard/advice/{id}/read"]?.patch);
  assert.ok(paths["/api/v2/auth/me"]?.patch);
});

test("OpenAPI documents category retrieval, soft deletion, and count severities", () => {
  type Operation = {
    summary?: string;
    responses?: Record<
      string,
      {
        content?: {
          "application/json"?: { example?: { data?: Record<string, unknown> } };
        };
      }
    >;
  };
  const paths =
    (
      swaggerSpec as unknown as {
        paths?: Record<string, Record<string, Operation>>;
      }
    ).paths ?? {};

  assert.ok(paths["/api/v2/categories/{id}"]?.get);
  assert.match(paths["/api/v2/categories/{id}"]?.delete?.summary ?? "", /desactivar/i);
  assert.deepEqual(
    paths["/api/v2/transactions/counts-by-level"]?.get?.responses?.["200"]?.content?.[
      "application/json"
    ]?.example?.data,
    { BAJO: 3, MEDIO: 2, ALTO: 1, CRITICO: 0 },
  );
  assert.deepEqual(
    paths["/api/v2/alerts/counts-by-level"]?.get?.responses?.["200"]?.content?.["application/json"]
      ?.example?.data,
    { BAJA: 3, MEDIA: 2, ALTA: 1, CRITICA: 0 },
  );
});

test("OpenAPI only references existing local components", () => {
  const resolvePointer = (pointer: string) =>
    pointer
      .slice(2)
      .split("/")
      .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"))
      .reduce<unknown>((current, part) => {
        assert.ok(
          typeof current === "object" && current !== null && part in current,
          `OpenAPI reference not found: ${pointer}`,
        );
        return (current as Record<string, unknown>)[part];
      }, swaggerSpec);

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value !== "object" || value === null) return;
    for (const [key, nested] of Object.entries(value)) {
      if (key === "$ref" && typeof nested === "string" && nested.startsWith("#/")) {
        resolvePointer(nested);
      } else {
        visit(nested);
      }
    }
  };

  visit(swaggerSpec);
});

test("Prisma known errors are recognized across duplicated runtime instances", () => {
  assert.equal(
    isPrismaKnownRequestError({
      name: "PrismaClientKnownRequestError",
      code: "P2003",
      clientVersion: "6.19.3",
    }),
    true,
  );
  assert.equal(isPrismaKnownRequestError(new Error("database error")), false);
});

test("password reset tokens are short-lived, purpose-bound and invalidated by password changes", () => {
  const serverSecret = "a-secure-test-secret-that-is-at-least-32-characters";
  const passwordHash = "$2b$10$old-password-hash";
  const token = createPasswordResetToken(42, passwordHash, serverSecret);
  const claims = jwt.decode(token);
  assert.equal(jwt.decode(token, { complete: true })?.header.alg, "HS256");

  assert.equal(getUnverifiedPasswordResetUserId(token), 42);
  assert.equal(
    typeof claims === "object" && claims !== null ? claims.exp! - claims.iat! : null,
    PASSWORD_RESET_TOKEN_TTL_SECONDS,
  );
  assert.equal(verifyPasswordResetToken(token, 42, passwordHash, serverSecret), true);
  assert.equal(
    verifyPasswordResetToken(token, 42, "$2b$10$new-password-hash", serverSecret),
    false,
  );
  assert.equal(verifyPasswordResetToken(token, 42, passwordHash, `${serverSecret}-changed`), false);
  assert.equal(getUnverifiedPasswordResetUserId("not-a-jwt"), null);
});

test("email verification tokens bind the user and normalized email", () => {
  const serverSecret = "a-secure-test-secret-that-is-at-least-32-characters";
  const token = createEmailVerificationToken(42, "ana@email.com", serverSecret);
  const claims = jwt.decode(token);

  assert.equal(getUnverifiedEmailVerificationUserId(token), 42);
  assert.equal(jwt.decode(token, { complete: true })?.header.alg, "HS256");
  assert.equal(
    typeof claims === "object" && claims !== null ? claims.exp! - claims.iat! : null,
    EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
  );
  assert.equal(EMAIL_VERIFICATION_TOKEN_TTL_SECONDS, 15 * 60);
  assert.equal(verifyEmailVerificationToken(token, 42, "ana@email.com", serverSecret), true);
  assert.equal(verifyEmailVerificationToken(token, 42, "other@email.com", serverSecret), false);
  assert.equal(
    verifyEmailVerificationToken(token, 42, "ana@email.com", `${serverSecret}-changed`),
    false,
  );
  assert.equal(getUnverifiedEmailVerificationUserId("not-a-jwt"), null);
});

test("password reset token verification is documented as a POST body, not a query string", () => {
  const paths = (
    swaggerSpec as {
      paths?: Record<string, { get?: unknown; post?: { requestBody?: unknown } }>;
    }
  ).paths;
  const path = paths?.["/api/v2/auth/verify-reset-token"];
  assert.ok(path?.post);
  assert.equal(path?.get, undefined);
  assert.ok(path?.post.requestBody);
});

test("savings funding validates positive IDs and contribution amounts", () => {
  assert.equal(savingsIdSchema.parse("1"), 1);
  assert.equal(savingsIdSchema.safeParse("1.5").success, false);
  assert.equal(addFundsSchema.safeParse({ monto: 100 }).success, false);
  assert.equal(addFundsSchema.safeParse({ monto: 1000 }).success, true);
  assert.equal(addFundsSchema.safeParse({ monto: 0 }).success, false);
});

test("savings state derives from progress and preserves paused or cancelled status", () => {
  assert.equal(
    deriveSavingsState(new Prisma.Decimal(50), new Prisma.Decimal(100), "ACTIVA", "COMPLETADA"),
    "COMPLETADA",
  );
  assert.equal(
    deriveSavingsState(new Prisma.Decimal(100), new Prisma.Decimal(100), "ACTIVA", "COMPLETADA"),
    "COMPLETADA",
  );
  assert.equal(
    deriveSavingsState(new Prisma.Decimal(50), new Prisma.Decimal(100), "ACTIVA", "PAUSADA"),
    "PAUSADA",
  );
  assert.equal(
    deriveSavingsState(new Prisma.Decimal(50), new Prisma.Decimal(100), "PAUSADA"),
    "PAUSADA",
  );
  assert.equal(
    deriveSavingsState(new Prisma.Decimal(50), new Prisma.Decimal(100), "CANCELADA"),
    "CANCELADA",
  );
  assert.equal(
    deriveSavingsState(new Prisma.Decimal(50), new Prisma.Decimal(100), "PAUSADA", "ACTIVA"),
    "ACTIVA",
  );
});

test("OpenAPI documents concrete success data and common errors for every API operation", () => {
  type DocumentedResponse = {
    $ref?: string;
    content?: {
      "application/json"?: {
        example?: unknown;
        schema?: {
          $ref?: string;
          type?: string;
          properties?: Record<string, { enum?: unknown[]; $ref?: string }>;
        };
      };
      "text/csv"?: {
        schema?: { type?: string; format?: string };
      };
    };
  };
  type Operation = {
    security?: unknown[];
    responses?: Record<string, DocumentedResponse>;
  };
  const spec = swaggerSpec as unknown as {
    paths?: Record<string, Record<string, Operation>>;
    components?: {
      responses?: Record<string, unknown>;
      schemas?: Record<
        string,
        {
          type?: string;
          properties?: Record<string, unknown>;
          additionalProperties?: unknown;
        }
      >;
    };
  };
  const paths = spec.paths ?? {};
  const methods = new Set(["get", "post", "put", "patch", "delete"]);
  let operationCount = 0;

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!path.startsWith("/api/v2/")) continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!methods.has(method)) continue;
      operationCount += 1;
      const responses = operation.responses ?? {};

      for (const status of ["400", "429", "500"]) {
        assert.ok(responses[status], `${method.toUpperCase()} ${path} should document ${status}`);
      }

      for (const [status, response] of Object.entries(responses)) {
        if (/^2\d\d$/.test(status) && !response.$ref) {
          const csvSchema = response.content?.["text/csv"]?.schema;
          if (csvSchema) {
            assert.equal(csvSchema.type, "string");
            assert.equal(csvSchema.format, "binary");
            continue;
          }
          const jsonContent = response.content?.["application/json"];
          const schema = jsonContent?.schema;
          assert.equal(schema?.type, "object");
          assert.deepEqual(
            schema?.properties?.success?.enum,
            [true],
            `${method.toUpperCase()} ${path} should document a successful envelope`,
          );
          const dataRef = schema?.properties?.data?.$ref;
          assert.ok(dataRef?.startsWith("#/components/schemas/"));
          assert.notEqual(dataRef, "#/components/schemas/SuccessResponse");
          const dataSchemaName = dataRef?.split("/").pop();
          const dataSchema = dataSchemaName
            ? spec.components?.schemas?.[dataSchemaName]
            : undefined;
          assert.ok(dataSchema);
          assert.ok(
            dataSchema.type === "array" ||
              Object.keys(dataSchema.properties ?? {}).length > 0 ||
              dataSchema.additionalProperties,
            `${method.toUpperCase()} ${path} should describe the data structure`,
          );
          const example = jsonContent?.example;
          assert.ok(example && typeof example === "object");
          const exampleEnvelope = example as Record<string, unknown>;
          assert.equal(
            exampleEnvelope.success,
            true,
            `${method.toUpperCase()} ${path} example should use the success envelope`,
          );
          assert.ok("data" in exampleEnvelope);
        }
      }

      if (operation.security?.length) {
        assert.ok(responses["401"], `${method.toUpperCase()} ${path} should document 401`);
        assert.ok(responses["403"], `${method.toUpperCase()} ${path} should document 403`);
      }

      if (path.includes("{id}")) {
        assert.ok(responses["404"], `${method.toUpperCase()} ${path} should document 404`);
      }

      for (const [status, response] of Object.entries(responses)) {
        if (/^[45]\d\d$/.test(status)) {
          assert.ok(
            response.$ref || response.content?.["application/json"]?.schema?.$ref,
            `${method.toUpperCase()} ${path} response ${status} should have a schema`,
          );
        }
      }
    }
  }

  assert.ok(operationCount > 0);
});

test("OpenAPI specification passes Swagger Parser validation", async () => {
  const document = JSON.parse(JSON.stringify(swaggerSpec)) as Parameters<
    typeof SwaggerParser.validate
  >[0];
  await SwaggerParser.validate(document);
});

test("OpenAPI documents the pending transaction resolution route and response envelopes", () => {
  const spec = swaggerSpec as {
    paths?: Record<
      string,
      {
        get?: unknown;
        post?: unknown;
        patch?: { requestBody?: unknown };
      }
    >;
    components?: {
      responses?: Record<string, unknown>;
      schemas?: Record<string, unknown>;
    };
  };
  assert.ok(spec.paths?.["/api/v2/transactions/{id}/status"]?.patch?.requestBody);
  assert.ok(spec.paths?.["/api/v2/transactions/{id}/category"]?.patch?.requestBody);
  assert.ok(spec.paths?.["/api/v2/transactions/email-confirmation"]?.get);
  assert.ok(spec.paths?.["/api/v2/transactions/email-confirmation"]?.post);
  assert.ok(spec.paths?.["/api/v2/integrations/transactions/webhook"]?.post);
  assert.ok(spec.components?.schemas?.ExternalTransactionWebhookRequest);
  assert.ok(spec.components?.schemas?.TransactionStatusData);
  assert.equal(spec.components?.schemas?.SuccessResponse, undefined);
  assert.ok(spec.components?.schemas?.ErrorResponse);
  assert.ok(spec.components?.responses?.BadRequestError);
  assert.ok(spec.components?.responses?.TooManyRequestsError);
  assert.ok(spec.components?.schemas?.RateLimitErrorResponse);
});
