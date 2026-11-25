import assert from "node:assert/strict";
import test from "node:test";
import dotenv from "dotenv";
import { createHmac, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createPasswordResetToken } from "../modules/auth/reset-token.js";
import { fingerprintExternalEvent } from "../modules/transactions/transaction-archive.js";
import { createTransactionConfirmationToken } from "../modules/transactions/transaction-confirmation-token.js";

dotenv.config();

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL debe apuntar a una base PostgreSQL exclusiva de pruebas");
}

const databaseIdentity = (value: string) => {
  const url = new URL(value);
  return `${url.hostname}:${url.port || "5432"}${decodeURIComponent(url.pathname)}`;
};

const testDatabaseName = decodeURIComponent(new URL(testDatabaseUrl).pathname);
assert.match(
  testDatabaseName,
  /(test|testing|prueba|pruebas|ci)/i,
  "El nombre de la base indicada por TEST_DATABASE_URL debe identificarla como base de pruebas",
);

if (process.env.DATABASE_URL) {
  assert.notEqual(
    databaseIdentity(testDatabaseUrl),
    databaseIdentity(process.env.DATABASE_URL),
    "TEST_DATABASE_URL no puede apuntar a la misma base que DATABASE_URL",
  );
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "integration-test-secret-not-for-production";
process.env.JWT_EXPIRES_IN = "8h";
process.env.SMTP_ENABLED = "false";
const transactionWebhookSecret = "integration-webhook-secret-for-tests-32";
process.env.TRANSACTION_WEBHOOK_SECRET = transactionWebhookSecret;

function createSignedWebhookRequest(payload: unknown, secret = transactionWebhookSecret) {
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

  return {
    body,
    headers: {
      "content-type": "application/json",
      "x-trida-webhook-secret": secret,
      "x-trida-timestamp": timestamp,
      "x-trida-signature": signature,
    },
  };
}

type SuccessEnvelope<T> = {
  success: true;
  data: T;
};

type FailureEnvelope = {
  success: false;
  error: { code: string; message: string };
};

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

test("transaction routes keep account balances consistent across creation and resolution", async () => {
  const [{ default: app }, { prisma }] = await Promise.all([
    import("../app.js"),
    import("../db/prisma.js"),
  ]);
  const server = app.listen(0);
  const email = `integration-${randomUUID()}@example.test`;
  const otherEmail = `integration-${randomUUID()}@example.test`;
  let userId: number | undefined;
  let otherUserId: number | undefined;

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const serverUrl = `http://127.0.0.1:${address.port}`;
    const baseUrl = `${serverUrl}/api/v2`;

    const readinessResponse = await fetch(`${serverUrl}/health/ready`);
    assert.equal(readinessResponse.status, 200);
    assert.deepEqual(await readJson(readinessResponse), {
      status: "ready",
      service: "trida-backend",
      version: "2.0.0",
    });

    const registrationResponse = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nombre_completo: "Usuario de integración",
        email,
        password: "TestPassword123!",
      }),
    });
    assert.equal(registrationResponse.status, 201);
    const registeredUser = await prisma.usuario.findUniqueOrThrow({
      where: { email },
      select: { id_usuario: true, email_verificado_en: true },
    });
    userId = registeredUser.id_usuario;
    assert.ok(registeredUser.email_verificado_en);

    const duplicateRegistrationResponse = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nombre_completo: "Otro Nombre",
        email,
        password: "TestPassword123!",
      }),
    });
    assert.equal(duplicateRegistrationResponse.status, 201);
    assert.deepEqual(
      await readJson<SuccessEnvelope<{ emailVerificationRequired: boolean }>>(
        duplicateRegistrationResponse,
      ),
      await readJson<SuccessEnvelope<{ emailVerificationRequired: boolean }>>(registrationResponse),
    );

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "TestPassword123!" }),
    });
    assert.equal(loginResponse.status, 200);
    const login =
      await readJson<SuccessEnvelope<{ token: string; usuario: { id_usuario: number } }>>(
        loginResponse,
      );
    const loginClaims = jwt.decode(login.data.token);
    assert.equal(
      typeof loginClaims === "object" && loginClaims !== null
        ? loginClaims.exp! - loginClaims.iat!
        : null,
      8 * 60 * 60,
    );
    let authorization = { authorization: `Bearer ${login.data.token}` };
    const loggedInUser = await prisma.usuario.findUnique({
      where: { id_usuario: login.data.usuario.id_usuario },
      select: { ultimo_acceso: true },
    });
    assert.ok(loggedInUser?.ultimo_acceso);

    const failedLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "IncorrectPassword123!" }),
    });
    assert.equal(failedLoginResponse.status, 401);

    const ownerMarker = `audit-owner-${randomUUID()}`;
    await prisma.log_auditoria.create({
      data: {
        id_usuario: userId,
        tipo_accion: "INICIO_SESION_FALLIDO",
        entidad_afectada: "usuarios",
        descripcion: ownerMarker,
        direccion_ip: "192.0.2.1",
      },
    });
    const auditResponse = await fetch(`${baseUrl}/audit?limit=50`, {
      headers: authorization,
    });
    assert.equal(auditResponse.status, 200);
    const auditHistory = await readJson<
      SuccessEnvelope<{
        items: Array<{
          id_log: number;
          tipo_accion: string;
          descripcion: string | null;
          direccion_ip?: string;
        }>;
        has_more: boolean;
        next_cursor: number | null;
      }>
    >(auditResponse);
    assert.ok(
      auditHistory.data.items.some((event) => event.tipo_accion === "INICIO_SESION_EXITOSO"),
    );
    assert.ok(
      auditHistory.data.items.some((event) => event.tipo_accion === "INICIO_SESION_FALLIDO"),
    );
    assert.ok(auditHistory.data.items.some((event) => event.descripcion === ownerMarker));
    assert.ok(auditHistory.data.items.every((event) => !("direccion_ip" in event)));
    const retainedAuditEvent = auditHistory.data.items.find(
      (event) => event.descripcion === ownerMarker,
    );
    assert.ok(retainedAuditEvent);
    const retainedAuditIp = await prisma.log_auditoria.findUniqueOrThrow({
      where: { id_log: retainedAuditEvent.id_log },
      select: { direccion_ip: true },
    });
    assert.equal(retainedAuditIp.direccion_ip, "192.0.2.1");
    const auditWriteResponse = await fetch(`${baseUrl}/audit`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({ tipo_accion: "INICIO_SESION_FALLIDO" }),
    });
    assert.equal(auditWriteResponse.status, 404);
    const unauthenticatedAuditResponse = await fetch(`${baseUrl}/audit`);
    assert.equal(unauthenticatedAuditResponse.status, 401);

    const firstAuditPageResponse = await fetch(`${baseUrl}/audit?limit=1`, {
      headers: authorization,
    });
    assert.equal(firstAuditPageResponse.status, 200);
    const firstAuditPage = await readJson<
      SuccessEnvelope<{
        items: Array<{ id_log: number }>;
        has_more: boolean;
        next_cursor: number | null;
      }>
    >(firstAuditPageResponse);
    assert.equal(firstAuditPage.data.has_more, true);
    assert.ok(firstAuditPage.data.next_cursor);
    assert.equal(firstAuditPage.data.items.length, 1);
    const firstAuditId = firstAuditPage.data.items[0]?.id_log;
    assert.ok(firstAuditId);
    const olderAuditPageResponse = await fetch(
      `${baseUrl}/audit?limit=1&before_id=${firstAuditPage.data.next_cursor}`,
      { headers: authorization },
    );
    assert.equal(olderAuditPageResponse.status, 200);
    const olderAuditPage =
      await readJson<SuccessEnvelope<{ items: Array<{ id_log: number }> }>>(olderAuditPageResponse);
    const olderAuditId = olderAuditPage.data.items[0]?.id_log;
    assert.ok(olderAuditId);
    assert.ok(olderAuditId < firstAuditId);

    const accountResponse = await fetch(`${baseUrl}/accounts`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        nombre: "Cuenta de integración",
        tipo: "EFECTIVO",
        saldo_inicial: 100,
      }),
    });
    assert.equal(accountResponse.status, 201);
    const account = await readJson<SuccessEnvelope<{ id_cuenta: number }>>(accountResponse);
    const accountId = account.data.id_cuenta;

    const dashboardStatsResponse = await fetch(`${baseUrl}/dashboard/stats`, {
      headers: authorization,
    });
    assert.equal(dashboardStatsResponse.status, 200);
    const dashboardStats =
      await readJson<SuccessEnvelope<{ saldo_total: number }>>(dashboardStatsResponse);
    assert.equal(dashboardStats.data.saldo_total, 100);

    const confirmationAccount = await prisma.cuenta.create({
      data: {
        id_usuario: userId,
        nombre: "Cuenta para prueba de confirmación",
        tipo: "EFECTIVO",
        saldo_inicial: 100,
        saldo_actual: 100,
      },
    });
    const confirmationEvent = {
      fuente: "CONFIRMATION_TEST",
      id_evento: randomUUID(),
      id_cuenta: confirmationAccount.id_cuenta,
      monto: 11,
      tipo_movimiento: "GASTO" as const,
      descripcion: "Prueba de decisión de un solo uso",
    };
    const pendingConfirmation = await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: confirmationAccount.id_cuenta,
        tipo_movimiento: "GASTO",
        monto: confirmationEvent.monto,
        descripcion: confirmationEvent.descripcion,
        canal: "webhook",
        fuente_externa: confirmationEvent.fuente,
        id_evento_externo: confirmationEvent.id_evento,
        huella_evento_externo: fingerprintExternalEvent(confirmationEvent),
        estado: "PENDIENTE",
      },
    });
    const confirmationToken = createTransactionConfirmationToken(
      { id_usuario: userId, id_transaccion: pendingConfirmation.id_transaccion },
      process.env.JWT_SECRET!,
    );
    const mismatchedOwnerToken = createTransactionConfirmationToken(
      { id_usuario: userId + 1, id_transaccion: pendingConfirmation.id_transaccion },
      process.env.JWT_SECRET!,
    );
    const mismatchedReadResponse = await fetch(
      `${baseUrl}/transactions/email-confirmation?token=${encodeURIComponent(mismatchedOwnerToken)}`,
    );
    assert.equal(mismatchedReadResponse.status, 404);
    assert.equal(mismatchedReadResponse.headers.get("cache-control"), "no-store");
    const mismatchedDecisionResponse = await fetch(`${baseUrl}/transactions/email-confirmation`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: mismatchedOwnerToken, decision: "NO_FUI_YO" }),
    });
    assert.equal(mismatchedDecisionResponse.status, 404);
    assert.equal(mismatchedDecisionResponse.headers.get("cache-control"), "no-store");
    assert.equal(
      (
        await prisma.transaccion.findUniqueOrThrow({
          where: { id_transaccion: pendingConfirmation.id_transaccion },
          select: { estado: true },
        })
      ).estado,
      "PENDIENTE",
    );
    const readConfirmationResponse = await fetch(
      `${baseUrl}/transactions/email-confirmation?token=${encodeURIComponent(confirmationToken)}`,
    );
    assert.equal(readConfirmationResponse.status, 200);
    assert.equal(readConfirmationResponse.headers.get("cache-control"), "no-store");
    const firstConfirmationResponse = await fetch(`${baseUrl}/transactions/email-confirmation`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: confirmationToken, decision: "FUI_YO" }),
    });
    assert.equal(firstConfirmationResponse.status, 200);
    const replayedConfirmationResponse = await fetch(`${baseUrl}/transactions/email-confirmation`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: confirmationToken, decision: "FUI_YO" }),
    });
    assert.equal(replayedConfirmationResponse.status, 409);
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: confirmationAccount.id_cuenta },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      89,
    );

    const archivedEvent = {
      fuente: "SIMULADOR",
      id_evento: randomUUID(),
      id_cuenta: accountId,
      monto: 42,
      tipo_movimiento: "INGRESO" as const,
      descripcion: "Movimiento anual de integración",
      fecha_transaccion: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const archivedEventId = await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: accountId,
        tipo_movimiento: archivedEvent.tipo_movimiento,
        monto: archivedEvent.monto,
        descripcion: archivedEvent.descripcion,
        canal: "webhook",
        fuente_externa: archivedEvent.fuente,
        id_evento_externo: archivedEvent.id_evento,
        huella_evento_externo: fingerprintExternalEvent(archivedEvent),
        estado: "CONFIRMADA",
        fecha_transaccion: new Date(archivedEvent.fecha_transaccion),
      },
      select: { id_transaccion: true },
    });
    const prepareArchiveResponse = await fetch(`${baseUrl}/transactions/archive/prepare`, {
      method: "POST",
      headers: authorization,
    });
    assert.equal(prepareArchiveResponse.status, 200);
    const archivePreparation = await readJson<
      SuccessEnvelope<{
        id_exportacion: number;
        total: number;
        fecha_corte: string;
      }>
    >(prepareArchiveResponse);
    assert.ok(archivePreparation.data.id_exportacion);
    assert.ok(archivePreparation.data.total >= 1);

    const prematurePurgeResponse = await fetch(
      `${baseUrl}/transactions/archive/${archivePreparation.data.id_exportacion}/purge`,
      { method: "POST", headers: authorization },
    );
    assert.equal(prematurePurgeResponse.status, 409);

    const individualDeleteResponse = await fetch(
      `${baseUrl}/transactions/${archivedEventId.id_transaccion}`,
      { method: "DELETE", headers: authorization },
    );
    assert.equal(individualDeleteResponse.status, 409);

    const archiveDownloadResponse = await fetch(
      `${baseUrl}/transactions/archive/${archivePreparation.data.id_exportacion}/download`,
      { method: "POST", headers: authorization },
    );
    assert.equal(archiveDownloadResponse.status, 200);
    assert.match(archiveDownloadResponse.headers.get("content-type") ?? "", /text\/csv/);
    const archivedCsv = await archiveDownloadResponse.text();
    assert.match(archivedCsv, /Movimiento anual de integración/);
    assert.match(archivedCsv, new RegExp(archivedEvent.id_evento));

    const purgeArchiveResponse = await fetch(
      `${baseUrl}/transactions/archive/${archivePreparation.data.id_exportacion}/purge`,
      { method: "POST", headers: authorization },
    );
    assert.equal(purgeArchiveResponse.status, 200);
    const purgeResult = await readJson<
      SuccessEnvelope<{
        eliminadas: number;
        omitidas: number;
        saldos_modificados: boolean;
      }>
    >(purgeArchiveResponse);
    assert.equal(purgeResult.data.eliminadas, archivePreparation.data.total);
    assert.equal(purgeResult.data.omitidas, 0);
    assert.equal(purgeResult.data.saldos_modificados, false);
    assert.equal(
      await prisma.transaccion.findUnique({
        where: { id_transaccion: archivedEventId.id_transaccion },
      }),
      null,
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: accountId },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      100,
    );

    const archivedReplayRequest = createSignedWebhookRequest(archivedEvent);
    const archivedReplayResponse = await fetch(`${baseUrl}/integrations/transactions/webhook`, {
      method: "POST",
      headers: { ...authorization, ...archivedReplayRequest.headers },
      body: archivedReplayRequest.body,
    });
    assert.equal(archivedReplayResponse.status, 200);
    const archivedReplay =
      await readJson<
        SuccessEnvelope<{ id_transaccion: number; duplicado: boolean; archivado: boolean }>
      >(archivedReplayResponse);
    assert.equal(archivedReplay.data.id_transaccion, archivedEventId.id_transaccion);
    assert.equal(archivedReplay.data.duplicado, true);
    assert.equal(archivedReplay.data.archivado, true);

    const conflictingArchivedReplayRequest = createSignedWebhookRequest({
      ...archivedEvent,
      monto: 43,
    });
    const conflictingArchivedReplay = await fetch(`${baseUrl}/integrations/transactions/webhook`, {
      method: "POST",
      headers: conflictingArchivedReplayRequest.headers,
      body: conflictingArchivedReplayRequest.body,
    });
    assert.equal(conflictingArchivedReplay.status, 409);

    const transferSource = await prisma.cuenta.create({
      data: {
        id_usuario: login.data.usuario.id_usuario,
        nombre: `Origen transferencia ${randomUUID()}`,
        tipo: "BANCO",
        saldo_inicial: 100,
        saldo_actual: 100,
      },
    });
    const transferDestination = await prisma.cuenta.create({
      data: {
        id_usuario: login.data.usuario.id_usuario,
        nombre: `Destino transferencia ${randomUUID()}`,
        tipo: "BILLETERA",
        saldo_inicial: 40,
        saldo_actual: 40,
      },
    });
    const transferEvent = {
      fuente: "SIMULADOR",
      id_evento: randomUUID(),
      id_cuenta: transferSource.id_cuenta,
      id_cuenta_destino: transferDestination.id_cuenta,
      monto: 15,
      tipo_movimiento: "TRANSFERENCIA",
    };
    const invalidWebhookRequest = createSignedWebhookRequest(
      transferEvent,
      "incorrect-webhook-secret",
    );
    const invalidWebhookSecretResponse = await fetch(
      `${baseUrl}/integrations/transactions/webhook`,
      {
        method: "POST",
        headers: invalidWebhookRequest.headers,
        body: invalidWebhookRequest.body,
      },
    );
    assert.equal(invalidWebhookSecretResponse.status, 401);

    const transferRequest = createSignedWebhookRequest(transferEvent);
    const transferResponse = await fetch(`${baseUrl}/integrations/transactions/webhook`, {
      method: "POST",
      headers: transferRequest.headers,
      body: transferRequest.body,
    });
    assert.equal(transferResponse.status, 201);
    const transfer = await readJson<
      SuccessEnvelope<{
        id_transaccion: number;
        estado: string;
        duplicado: boolean;
      }>
    >(transferResponse);
    assert.equal(transfer.data.estado, "CONFIRMADA");
    assert.equal(transfer.data.duplicado, false);

    const duplicateTransferRequest = createSignedWebhookRequest(transferEvent);
    const duplicateTransferResponse = await fetch(`${baseUrl}/integrations/transactions/webhook`, {
      method: "POST",
      headers: duplicateTransferRequest.headers,
      body: duplicateTransferRequest.body,
    });
    assert.equal(duplicateTransferResponse.status, 200);
    const duplicateTransfer = await readJson<
      SuccessEnvelope<{
        id_transaccion: number;
        duplicado: boolean;
      }>
    >(duplicateTransferResponse);
    assert.equal(duplicateTransfer.data.id_transaccion, transfer.data.id_transaccion);
    assert.equal(duplicateTransfer.data.duplicado, true);

    const conflictingTransferRequest = createSignedWebhookRequest({
      ...transferEvent,
      monto: 16,
    });
    const conflictingTransferResponse = await fetch(
      `${baseUrl}/integrations/transactions/webhook`,
      {
        method: "POST",
        headers: conflictingTransferRequest.headers,
        body: conflictingTransferRequest.body,
      },
    );
    assert.equal(conflictingTransferResponse.status, 409);

    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: transferSource.id_cuenta },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      85,
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: transferDestination.id_cuenta },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      55,
    );
    const destinationTransactionsResponse = await fetch(
      `${baseUrl}/transactions?id_cuenta=${transferDestination.id_cuenta}&limit=100`,
      { headers: authorization },
    );
    assert.equal(destinationTransactionsResponse.status, 200);
    const destinationTransactions = await readJson<
      SuccessEnvelope<{
        items: Array<{
          id_transaccion: number;
          id_cuenta_destino: number | null;
        }>;
      }>
    >(destinationTransactionsResponse);
    assert.ok(
      destinationTransactions.data.items.some(
        (item) =>
          item.id_transaccion === transfer.data.id_transaccion &&
          item.id_cuenta_destino === transferDestination.id_cuenta,
      ),
    );

    const reportCategory = await prisma.categoria.create({
      data: {
        id_usuario: userId,
        nombre: `Categoría de reporte ${randomUUID()}`,
        tipo: "GASTO",
      },
    });
    const reportAccount = await prisma.cuenta.create({
      data: {
        id_usuario: userId,
        nombre: `Cuenta de reporte ${randomUUID()}`,
        tipo: "BANCO",
        saldo_inicial: 0,
        saldo_actual: 0,
      },
    });
    const reportDate = new Date();
    await prisma.transaccion.createMany({
      data: [
        {
          id_usuario: userId,
          id_cuenta: reportAccount.id_cuenta,
          id_categoria: reportCategory.id_categoria,
          tipo_movimiento: "GASTO",
          monto: 70,
          estado: "CONFIRMADA",
          fecha_transaccion: reportDate,
        },
        {
          id_usuario: userId,
          id_cuenta: reportAccount.id_cuenta,
          id_categoria: null,
          tipo_movimiento: "GASTO",
          monto: 30,
          estado: "CONFIRMADA",
          fecha_transaccion: reportDate,
        },
        {
          id_usuario: userId,
          id_cuenta: reportAccount.id_cuenta,
          tipo_movimiento: "INGRESO",
          monto: 200,
          estado: "CONFIRMADA",
          fecha_transaccion: reportDate,
        },
        {
          id_usuario: userId,
          id_cuenta: reportAccount.id_cuenta,
          tipo_movimiento: "AHORRO",
          monto: 20,
          estado: "CONFIRMADA",
          fecha_transaccion: reportDate,
        },
      ],
    });
    const reportParams = new URLSearchParams({
      id_cuenta: String(reportAccount.id_cuenta),
      fecha_inicio: new Date(reportDate.getTime() - 60_000).toISOString(),
      fecha_fin: new Date(reportDate.getTime() + 60_000).toISOString(),
    });
    const categoryReportResponse = await fetch(
      `${baseUrl}/reports/by-category?${reportParams.toString()}&tipo_movimiento=GASTO`,
      { headers: authorization },
    );
    assert.equal(categoryReportResponse.status, 200);
    const categoryReport = await readJson<
      SuccessEnvelope<{
        categorias: Array<{
          id_categoria: number | null;
          nombre: string;
          total: number;
          cantidad: number;
        }>;
      }>
    >(categoryReportResponse);
    assert.deepEqual(
      categoryReport.data.categorias.find((category) => category.id_categoria === null),
      {
        id_categoria: null,
        nombre: "Sin categoría",
        icono: null,
        color: null,
        total: 30,
        cantidad: 1,
      },
    );
    assert.equal(
      categoryReport.data.categorias.reduce((sum, category) => sum + category.total, 0),
      100,
    );
    const categorySummaryResponse = await fetch(
      `${baseUrl}/reports/summary?${reportParams.toString()}`,
      { headers: authorization },
    );
    assert.equal(categorySummaryResponse.status, 200);
    const categorySummary = await readJson<
      SuccessEnvelope<{
        totales: { ingresos: number; gastos: number; ahorros: number; balance: number };
      }>
    >(categorySummaryResponse);
    assert.deepEqual(categorySummary.data.totales, {
      ingresos: 200,
      gastos: 100,
      ahorros: 20,
      balance: 80,
    });

    const savingsResponse = await fetch(`${baseUrl}/savings`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        nombre: "Meta de integración",
        monto_objetivo: 1020,
        monto_actual: 20,
      }),
    });
    assert.equal(savingsResponse.status, 201);
    const saving =
      await readJson<SuccessEnvelope<{ id_meta: number; monto_actual: number; estado: string }>>(
        savingsResponse,
      );
    assert.equal(saving.data.monto_actual, 20);
    assert.equal(saving.data.estado, "ACTIVA");

    const addFundsResponse = await fetch(`${baseUrl}/savings/${saving.data.id_meta}/funds`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({ monto: 1000 }),
    });
    assert.equal(addFundsResponse.status, 200);
    const completedSaving =
      await readJson<SuccessEnvelope<{ monto_actual: number; estado: string }>>(addFundsResponse);
    assert.equal(completedSaving.data.monto_actual, 1020);
    assert.equal(completedSaving.data.estado, "COMPLETADA");

    const savedContributions = await prisma.aporte_meta.aggregate({
      where: { id_meta: saving.data.id_meta },
      _sum: { monto: true },
      _count: { _all: true },
    });
    assert.equal(Number(savedContributions._sum.monto), 1020);
    assert.equal(savedContributions._count._all, 2);

    const addFundsToCompletedResponse = await fetch(
      `${baseUrl}/savings/${saving.data.id_meta}/funds`,
      {
        method: "POST",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ monto: 1000 }),
      },
    );
    assert.equal(addFundsToCompletedResponse.status, 409);

    const completedAtCreationResponse = await fetch(`${baseUrl}/savings`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        nombre: "Meta completada al crear",
        monto_objetivo: 50,
        monto_actual: 50,
        fecha_limite: "2030-01-01",
      }),
    });
    assert.equal(completedAtCreationResponse.status, 201);
    const completedAtCreation = await readJson<
      SuccessEnvelope<{ id_meta: number; monto_actual: number; estado: string }>
    >(completedAtCreationResponse);
    assert.equal(completedAtCreation.data.monto_actual, 50);
    assert.equal(completedAtCreation.data.estado, "COMPLETADA");

    const clearDeadlineResponse = await fetch(
      `${baseUrl}/savings/${completedAtCreation.data.id_meta}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ monto_objetivo: 100, fecha_limite: null }),
      },
    );
    assert.equal(clearDeadlineResponse.status, 200);
    const clearedDeadline =
      await readJson<SuccessEnvelope<{ fecha_limite: string | null; estado: string }>>(
        clearDeadlineResponse,
      );
    assert.equal(clearedDeadline.data.fecha_limite, null);
    assert.equal(clearedDeadline.data.estado, "ACTIVA");

    const pauseGoalResponse = await fetch(
      `${baseUrl}/savings/${completedAtCreation.data.id_meta}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ estado: "PAUSADA" }),
      },
    );
    assert.equal(pauseGoalResponse.status, 200);
    const pausedGoal = await readJson<SuccessEnvelope<{ estado: string }>>(pauseGoalResponse);
    assert.equal(pausedGoal.data.estado, "PAUSADA");

    const keepPausedResponse = await fetch(
      `${baseUrl}/savings/${completedAtCreation.data.id_meta}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ monto_objetivo: 125 }),
      },
    );
    assert.equal(keepPausedResponse.status, 200);
    const keptPaused = await readJson<SuccessEnvelope<{ estado: string }>>(keepPausedResponse);
    assert.equal(keptPaused.data.estado, "PAUSADA");

    const cancelGoalResponse = await fetch(
      `${baseUrl}/savings/${completedAtCreation.data.id_meta}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ estado: "CANCELADA" }),
      },
    );
    assert.equal(cancelGoalResponse.status, 200);
    const cancelledGoal = await readJson<SuccessEnvelope<{ estado: string }>>(cancelGoalResponse);
    assert.equal(cancelledGoal.data.estado, "CANCELADA");

    const keepCancelledResponse = await fetch(
      `${baseUrl}/savings/${completedAtCreation.data.id_meta}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ monto_objetivo: 150 }),
      },
    );
    assert.equal(keepCancelledResponse.status, 200);
    const keptCancelled =
      await readJson<SuccessEnvelope<{ estado: string }>>(keepCancelledResponse);
    assert.equal(keptCancelled.data.estado, "CANCELADA");

    otherUserId = (
      await prisma.usuario.create({
        data: {
          nombre_completo: "Segundo usuario de integración",
          email: otherEmail,
          password_hash: await bcrypt.hash("TestPassword123!", 10),
          email_verificado_en: new Date(),
        },
      })
    ).id_usuario;

    const otherLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: otherEmail, password: "TestPassword123!" }),
    });
    assert.equal(otherLoginResponse.status, 200);
    const otherLogin =
      await readJson<SuccessEnvelope<{ token: string; usuario: { id_usuario: number } }>>(
        otherLoginResponse,
      );

    const sharedDeviceIdentifier = `integration-device-${randomUUID()}`;
    const firstDeviceResponse = await fetch(`${baseUrl}/devices`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        identificador_unico: sharedDeviceIdentifier,
        tipo_dispositivo: "BROWSER",
      }),
    });
    assert.equal(firstDeviceResponse.status, 201);
    const firstDevice =
      await readJson<SuccessEnvelope<{ id_dispositivo: number; confiable: boolean }>>(
        firstDeviceResponse,
      );
    assert.equal(firstDevice.data.confiable, true);
    const deviceAuditResponse = await fetch(`${baseUrl}/audit?limit=50`, {
      headers: authorization,
    });
    assert.equal(deviceAuditResponse.status, 200);
    const deviceAuditHistory =
      await readJson<SuccessEnvelope<{ items: Array<{ tipo_accion: string }> }>>(
        deviceAuditResponse,
      );
    assert.ok(
      deviceAuditHistory.data.items.some((event) => event.tipo_accion === "DISPOSITIVO_REGISTRADO"),
    );

    const otherAuthorization = {
      authorization: `Bearer ${otherLogin.data.token}`,
    };
    const otherAuditResponse = await fetch(`${baseUrl}/audit?limit=50`, {
      headers: otherAuthorization,
    });
    assert.equal(otherAuditResponse.status, 200);
    const otherAuditHistory =
      await readJson<SuccessEnvelope<{ items: Array<{ descripcion: string | null }> }>>(
        otherAuditResponse,
      );
    assert.equal(
      otherAuditHistory.data.items.some((event) => event.descripcion === ownerMarker),
      false,
    );

    const otherDeviceResponse = await fetch(`${baseUrl}/devices`, {
      method: "POST",
      headers: { ...otherAuthorization, "content-type": "application/json" },
      body: JSON.stringify({
        identificador_unico: sharedDeviceIdentifier,
        tipo_dispositivo: "BROWSER",
      }),
    });
    assert.equal(otherDeviceResponse.status, 201);
    const otherDevice =
      await readJson<SuccessEnvelope<{ id_dispositivo: number; confiable: boolean }>>(
        otherDeviceResponse,
      );
    assert.equal(otherDevice.data.confiable, true);

    const otherAccountResponse = await fetch(`${baseUrl}/accounts`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${otherLogin.data.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        nombre: "Cuenta del segundo usuario",
        tipo: "BANCO",
        entidad: "Banco de pruebas",
        numero_enmascarado: "4321",
        saldo_inicial: 5,
      }),
    });
    assert.equal(otherAccountResponse.status, 201);
    const otherAccount =
      await readJson<SuccessEnvelope<{ id_cuenta: number }>>(otherAccountResponse);
    const crossUserResponse = await fetch(`${baseUrl}/accounts/${otherAccount.data.id_cuenta}`, {
      headers: authorization,
    });
    assert.equal(crossUserResponse.status, 404);
    const crossUserError = await readJson<FailureEnvelope>(crossUserResponse);
    assert.equal(crossUserError.error.code, "ACCOUNT_ERROR");

    const transactionCountBeforeInvalidRequest = await prisma.transaccion.count({
      where: { id_usuario: userId },
    });
    const invalidAccountResponse = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        id_cuenta: 2_147_483_647,
        monto: 10,
        tipo_movimiento: "INGRESO",
      }),
    });
    assert.equal(invalidAccountResponse.status, 404);
    assert.equal(
      await prisma.transaccion.count({ where: { id_usuario: userId } }),
      transactionCountBeforeInvalidRequest,
    );

    const inactiveCategory = await prisma.categoria.create({
      data: {
        id_usuario: userId,
        nombre: `Categoría inactiva ${randomUUID()}`,
        tipo: "GASTO",
        estado: false,
      },
    });
    const mismatchedCategory = await prisma.categoria.create({
      data: {
        id_usuario: userId,
        nombre: `Categoría ingreso ${randomUUID()}`,
        tipo: "INGRESO",
        estado: true,
      },
    });

    const transactionCountBeforeCategoryValidation = await prisma.transaccion.count({
      where: { id_usuario: userId },
    });
    const inactiveCategoryResponse = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        id_cuenta: accountId,
        id_categoria: inactiveCategory.id_categoria,
        monto: 10,
        tipo_movimiento: "GASTO",
      }),
    });
    assert.equal(inactiveCategoryResponse.status, 404);

    const mismatchedCategoryResponse = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        id_cuenta: accountId,
        id_categoria: mismatchedCategory.id_categoria,
        monto: 10,
        tipo_movimiento: "GASTO",
      }),
    });
    assert.equal(mismatchedCategoryResponse.status, 400);
    assert.equal(
      await prisma.transaccion.count({ where: { id_usuario: userId } }),
      transactionCountBeforeCategoryValidation,
    );
    const manualBankTransactionResponse = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        id_cuenta: reportAccount.id_cuenta,
        monto: 10,
        tipo_movimiento: "GASTO",
      }),
    });
    assert.equal(manualBankTransactionResponse.status, 400);

    const unusedCategory = await prisma.categoria.create({
      data: {
        id_usuario: userId,
        nombre: `Categoría sin uso ${randomUUID()}`,
        tipo: "GASTO",
      },
    });
    const changeUnusedCategoryResponse = await fetch(
      `${baseUrl}/categories/${unusedCategory.id_categoria}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ tipo: "INGRESO" }),
      },
    );
    assert.equal(changeUnusedCategoryResponse.status, 200);
    assert.equal(
      (
        await prisma.categoria.findUniqueOrThrow({
          where: { id_categoria: unusedCategory.id_categoria },
          select: { tipo: true },
        })
      ).tipo,
      "INGRESO",
    );

    const transactionCategory = await prisma.categoria.create({
      data: {
        id_usuario: userId,
        nombre: `Categoría con movimiento ${randomUUID()}`,
        tipo: "GASTO",
      },
    });
    await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: accountId,
        id_categoria: transactionCategory.id_categoria,
        tipo_movimiento: "GASTO",
        monto: 5,
        estado: "CONFIRMADA",
      },
    });
    const changeTransactionCategoryResponse = await fetch(
      `${baseUrl}/categories/${transactionCategory.id_categoria}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ tipo: "INGRESO" }),
      },
    );
    assert.equal(changeTransactionCategoryResponse.status, 409);

    const transactionResponse = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        id_cuenta: accountId,
        id_dispositivo: firstDevice.data.id_dispositivo,
        monto: 25,
        tipo_movimiento: "GASTO",
        pais: "Colombia",
        fecha_transaccion: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      }),
    });
    assert.equal(transactionResponse.status, 201);
    const created = await readJson<
      SuccessEnvelope<{
        transaction: {
          id_transaccion: number;
          id_dispositivo: number | null;
          id_ubicacion: number | null;
          estado: string;
        };
        evaluation: { estado_evaluacion: string };
      }>
    >(transactionResponse);
    assert.equal(created.data.transaction.estado, "CONFIRMADA");
    assert.equal(created.data.transaction.id_dispositivo, firstDevice.data.id_dispositivo);
    assert.equal(created.data.evaluation.estado_evaluacion, "APROBADA");
    const locationId = created.data.transaction.id_ubicacion;
    assert.ok(locationId !== null);
    const storedLocation = await prisma.ubicacion.findUnique({
      where: { id_ubicacion: locationId },
      select: { direccion_ip: true },
    });
    assert.equal(storedLocation?.direccion_ip, null);
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: accountId },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      75,
    );

    const pending = await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: accountId,
        tipo_movimiento: "INGRESO",
        monto: 10,
        estado: "PENDIENTE",
      },
    });
    const pendingAlert = await prisma.alerta_fraude.create({
      data: {
        id_usuario: userId,
        id_transaccion: pending.id_transaccion,
        severidad: "MEDIA",
        motivo: "Confirmación de transacción pendiente",
      },
    });
    const approveResponse = await fetch(
      `${baseUrl}/transactions/${pending.id_transaccion}/status`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ estado: "CONFIRMADA" }),
      },
    );
    assert.equal(approveResponse.status, 200);
    assert.equal(
      (
        await prisma.transaccion.findUniqueOrThrow({
          where: { id_transaccion: pending.id_transaccion },
        })
      ).estado,
      "CONFIRMADA",
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: accountId },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      85,
    );
    const confirmedAlert = await prisma.alerta_fraude.findUniqueOrThrow({
      where: { id_alerta: pendingAlert.id_alerta },
    });
    assert.equal(confirmedAlert.estado, "DESCARTADA");
    assert.equal(confirmedAlert.accion_usuario, "FUI_YO");
    assert.ok(confirmedAlert.fecha_resuelta);
    const confirmationAudit = await prisma.log_auditoria.findFirst({
      where: {
        id_usuario: userId,
        tipo_accion: "TRANSACCION_RESUELTA",
        entidad_afectada: "transacciones",
        id_entidad: pending.id_transaccion,
      },
    });
    assert.match(confirmationAudit?.descripcion ?? "", /FUI_YO/);

    const resolveAgainResponse = await fetch(
      `${baseUrl}/transactions/${pending.id_transaccion}/status`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ estado: "RECHAZADA" }),
      },
    );
    assert.equal(resolveAgainResponse.status, 409);
    const resolveAgainError = await readJson<FailureEnvelope>(resolveAgainResponse);
    assert.equal(resolveAgainError.success, false);
    assert.equal(resolveAgainError.error.code, "TRANSACTION_ERROR");

    const rejected = await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: accountId,
        tipo_movimiento: "INGRESO",
        monto: 50,
        estado: "PENDIENTE",
      },
    });
    const directRejectAlert = await prisma.alerta_fraude.create({
      data: {
        id_usuario: userId,
        id_transaccion: rejected.id_transaccion,
        severidad: "MEDIA",
        motivo: "Rechazo de transacción pendiente",
      },
    });
    const rejectResponse = await fetch(
      `${baseUrl}/transactions/${rejected.id_transaccion}/status`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ estado: "RECHAZADA" }),
      },
    );
    assert.equal(rejectResponse.status, 200);
    assert.equal(
      (
        await prisma.transaccion.findUniqueOrThrow({
          where: { id_transaccion: rejected.id_transaccion },
        })
      ).estado,
      "RECHAZADA",
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: accountId },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      85,
    );
    const confirmedFraudAlert = await prisma.alerta_fraude.findUniqueOrThrow({
      where: { id_alerta: directRejectAlert.id_alerta },
    });
    assert.equal(confirmedFraudAlert.estado, "CONFIRMADA");
    assert.equal(confirmedFraudAlert.accion_usuario, "NO_FUI_YO");
    assert.ok(confirmedFraudAlert.fecha_resuelta);
    const rejectionAudit = await prisma.log_auditoria.findFirst({
      where: {
        id_usuario: userId,
        tipo_accion: "TRANSACCION_RESUELTA",
        entidad_afectada: "transacciones",
        id_entidad: rejected.id_transaccion,
      },
    });
    assert.match(rejectionAudit?.descripcion ?? "", /NO_FUI_YO/);

    const deleteResponse = await fetch(`${baseUrl}/transactions/${pending.id_transaccion}`, {
      method: "DELETE",
      headers: authorization,
    });
    assert.equal(deleteResponse.status, 409);
    const deleteError = await readJson<FailureEnvelope>(deleteResponse);
    assert.equal(deleteError.error.code, "INDIVIDUAL_TRANSACTION_DELETE_DISABLED");
    assert.ok(
      await prisma.transaccion.findUnique({
        where: { id_transaccion: pending.id_transaccion },
      }),
    );

    const deleteCreatedResponse = await fetch(
      `${baseUrl}/transactions/${created.data.transaction.id_transaccion}`,
      { method: "DELETE", headers: authorization },
    );
    assert.equal(deleteCreatedResponse.status, 409);
    const deleteCreatedError = await readJson<FailureEnvelope>(deleteCreatedResponse);
    assert.equal(deleteCreatedError.error.code, "INDIVIDUAL_TRANSACTION_DELETE_DISABLED");
    assert.ok(
      await prisma.transaccion.findUnique({
        where: { id_transaccion: created.data.transaction.id_transaccion },
      }),
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: accountId },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      85,
    );

    const budgetDate = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 15, 12),
    );
    const budgetCategory = await prisma.categoria.create({
      data: {
        id_usuario: userId,
        nombre: `Categoría presupuesto ${randomUUID()}`,
        tipo: "GASTO",
        color: "#2563eb",
      },
    });
    const createBudgetResponse = await fetch(`${baseUrl}/budgets`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        id_categoria: budgetCategory.id_categoria,
        limite_mensual: 120,
        mes: budgetDate.getUTCMonth() + 1,
        anio: budgetDate.getUTCFullYear(),
      }),
    });
    assert.equal(createBudgetResponse.status, 201);
    const createdBudget =
      await readJson<SuccessEnvelope<{ id_presupuesto: number; limite_mensual: number }>>(
        createBudgetResponse,
      );
    const changeUsedCategoryResponse = await fetch(
      `${baseUrl}/categories/${budgetCategory.id_categoria}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ tipo: "INGRESO" }),
      },
    );
    assert.equal(changeUsedCategoryResponse.status, 409);
    assert.equal(
      (
        await prisma.categoria.findUniqueOrThrow({
          where: { id_categoria: budgetCategory.id_categoria },
          select: { tipo: true },
        })
      ).tipo,
      "GASTO",
    );

    const updateBudgetResponse = await fetch(
      `${baseUrl}/budgets/${createdBudget.data.id_presupuesto}`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ limite_mensual: 100 }),
      },
    );
    assert.equal(updateBudgetResponse.status, 200);
    assert.equal(
      (await readJson<SuccessEnvelope<{ limite_mensual: number }>>(updateBudgetResponse)).data
        .limite_mensual,
      100,
    );
    const budgetId = createdBudget.data.id_presupuesto;
    await prisma.transaccion.createMany({
      data: [
        {
          id_usuario: userId,
          id_cuenta: accountId,
          id_categoria: budgetCategory.id_categoria,
          tipo_movimiento: "GASTO",
          monto: 60,
          estado: "CONFIRMADA",
          fecha_transaccion: budgetDate,
        },
        {
          id_usuario: userId,
          id_cuenta: accountId,
          id_categoria: budgetCategory.id_categoria,
          tipo_movimiento: "AHORRO",
          monto: 30,
          estado: "CONFIRMADA",
          fecha_transaccion: budgetDate,
        },
      ],
    });
    const budgetResponse = await fetch(
      `${baseUrl}/budgets?mes=${budgetDate.getUTCMonth() + 1}&anio=${budgetDate.getUTCFullYear()}`,
      { headers: authorization },
    );
    assert.equal(budgetResponse.status, 200);
    const budgets =
      await readJson<SuccessEnvelope<Array<{ id_presupuesto: number; gastado: number }>>>(
        budgetResponse,
      );
    assert.equal(budgets.data.find((item) => item.id_presupuesto === budgetId)?.gastado, 60);
    assert.equal(
      await prisma.consejo_financiero.count({
        where: {
          id_usuario: userId,
          titulo: "Presupuesto al 80%",
        },
      }),
      0,
    );
    for (const monto of [20, 20]) {
      await prisma.transaccion.create({
        data: {
          id_usuario: userId,
          id_cuenta: accountId,
          id_categoria: budgetCategory.id_categoria,
          tipo_movimiento: "GASTO",
          monto,
          estado: "CONFIRMADA",
          fecha_transaccion: budgetDate,
        },
      });
    }
    assert.equal(
      await prisma.consejo_financiero.count({
        where: { id_usuario: userId, titulo: "Presupuesto al 80%" },
      }),
      1,
    );
    assert.equal(
      await prisma.consejo_financiero.count({
        where: { id_usuario: userId, titulo: "Presupuesto excedido" },
      }),
      1,
    );

    await prisma.cuenta.update({
      where: { id_cuenta: accountId },
      data: { estado: false },
    });
    const listedAccounts = await fetch(`${baseUrl}/accounts`, {
      headers: authorization,
    });
    assert.equal(listedAccounts.status, 200);
    const accounts = await readJson<SuccessEnvelope<Array<{ id_cuenta: number }>>>(listedAccounts);
    assert.equal(
      accounts.data.some((item) => item.id_cuenta === accountId),
      false,
    );

    const inactiveAccountTransactions = await fetch(
      `${baseUrl}/transactions?id_cuenta=${accountId}`,
      { headers: authorization },
    );
    assert.equal(inactiveAccountTransactions.status, 200);
    const transactions = await readJson<
      SuccessEnvelope<{ items: Array<{ id_cuenta: number | null }> }>
    >(inactiveAccountTransactions);
    assert.equal(
      transactions.data.items.some((item) => item.id_cuenta === accountId),
      true,
    );

    const transactionCountBeforeInactiveAccountRequest = await prisma.transaccion.count({
      where: { id_usuario: userId },
    });
    const inactiveAccountTransaction = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        id_cuenta: accountId,
        monto: 10,
        tipo_movimiento: "INGRESO",
      }),
    });
    assert.equal(inactiveAccountTransaction.status, 404);
    assert.equal(
      await prisma.transaccion.count({ where: { id_usuario: userId } }),
      transactionCountBeforeInactiveAccountRequest,
    );

    const alertAccount = await prisma.cuenta.create({
      data: {
        id_usuario: userId,
        nombre: `Cuenta de alertas ${randomUUID()}`,
        tipo: "BANCO",
        saldo_inicial: 200,
        saldo_actual: 200,
      },
    });
    const alertTransaction = await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: alertAccount.id_cuenta,
        tipo_movimiento: "INGRESO",
        monto: 40,
        estado: "PENDIENTE",
      },
    });
    const alert = await prisma.alerta_fraude.create({
      data: {
        id_usuario: userId,
        id_transaccion: alertTransaction.id_transaccion,
        severidad: "MEDIA",
        motivo: "Alerta de integración",
      },
    });
    const resolveAlertResponse = await fetch(`${baseUrl}/alerts/${alert.id_alerta}/status`, {
      method: "PATCH",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        estado: "DESCARTADA",
        accion_usuario: "FUI_YO",
      }),
    });
    assert.equal(resolveAlertResponse.status, 200);
    assert.equal(
      (
        await prisma.transaccion.findUniqueOrThrow({
          where: { id_transaccion: alertTransaction.id_transaccion },
          select: { estado: true },
        })
      ).estado,
      "CONFIRMADA",
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: alertAccount.id_cuenta },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      240,
    );
    const repeatedResolveAlertResponse = await fetch(
      `${baseUrl}/alerts/${alert.id_alerta}/status`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({
          estado: "DESCARTADA",
          accion_usuario: "FUI_YO",
        }),
      },
    );
    assert.equal(repeatedResolveAlertResponse.status, 200);
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: alertAccount.id_cuenta },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      240,
    );

    const blockedTransaction = await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: alertAccount.id_cuenta,
        tipo_movimiento: "INGRESO",
        monto: 15,
        estado: "RECHAZADA",
      },
    });
    const blockedAlert = await prisma.alerta_fraude.create({
      data: {
        id_usuario: userId,
        id_transaccion: blockedTransaction.id_transaccion,
        severidad: "ALTA",
        motivo: "Bloqueo de integración",
      },
    });
    const releaseBlockedResponse = await fetch(
      `${baseUrl}/alerts/${blockedAlert.id_alerta}/status`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({
          estado: "DESCARTADA",
          accion_usuario: "FUI_YO",
        }),
      },
    );
    assert.equal(releaseBlockedResponse.status, 200);
    assert.equal(
      (
        await prisma.transaccion.findUniqueOrThrow({
          where: { id_transaccion: blockedTransaction.id_transaccion },
          select: { estado: true },
        })
      ).estado,
      "CONFIRMADA",
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: alertAccount.id_cuenta },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      255,
    );

    const rejectedAlertTransaction = await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: alertAccount.id_cuenta,
        tipo_movimiento: "GASTO",
        monto: 12,
        estado: "PENDIENTE",
      },
    });
    const rejectedAlert = await prisma.alerta_fraude.create({
      data: {
        id_usuario: userId,
        id_transaccion: rejectedAlertTransaction.id_transaccion,
        severidad: "MEDIA",
        motivo: "Rechazo de integración",
      },
    });
    const rejectAlertResponse = await fetch(`${baseUrl}/alerts/${rejectedAlert.id_alerta}/status`, {
      method: "PATCH",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        estado: "CONFIRMADA",
        accion_usuario: "NO_FUI_YO",
      }),
    });
    assert.equal(rejectAlertResponse.status, 200);
    assert.equal(
      (
        await prisma.transaccion.findUniqueOrThrow({
          where: { id_transaccion: rejectedAlertTransaction.id_transaccion },
          select: { estado: true },
        })
      ).estado,
      "RECHAZADA",
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: alertAccount.id_cuenta },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      255,
    );

    const automaticAlertTransaction = await prisma.transaccion.create({
      data: {
        id_usuario: userId,
        id_cuenta: alertAccount.id_cuenta,
        tipo_movimiento: "GASTO",
        monto: 18,
        canal: "webhook",
        estado: "PENDIENTE",
      },
    });
    const automaticAlert = await prisma.alerta_fraude.create({
      data: {
        id_usuario: userId,
        id_transaccion: automaticAlertTransaction.id_transaccion,
        severidad: "ALTA",
        motivo: "Gasto automático pendiente de revisión",
      },
    });
    const resolveAutomaticAlertResponse = await fetch(
      `${baseUrl}/alerts/${automaticAlert.id_alerta}/status`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({
          estado: "DESCARTADA",
          accion_usuario: "FUI_YO",
        }),
      },
    );
    assert.equal(resolveAutomaticAlertResponse.status, 200);
    assert.equal(
      (
        await prisma.transaccion.findUniqueOrThrow({
          where: { id_transaccion: automaticAlertTransaction.id_transaccion },
          select: { estado: true },
        })
      ).estado,
      "CONFIRMADA",
    );
    assert.equal(
      Number(
        (
          await prisma.cuenta.findUniqueOrThrow({
            where: { id_cuenta: alertAccount.id_cuenta },
            select: { saldo_actual: true },
          })
        ).saldo_actual,
      ),
      237,
    );

    const trustDeviceResponse = await fetch(
      `${baseUrl}/devices/${firstDevice.data.id_dispositivo}/trust`,
      {
        method: "PATCH",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({ confiable: false }),
      },
    );
    assert.equal(trustDeviceResponse.status, 200);
    const deleteDeviceResponse = await fetch(
      `${baseUrl}/devices/${firstDevice.data.id_dispositivo}`,
      { method: "DELETE", headers: authorization },
    );
    assert.equal(deleteDeviceResponse.status, 200);

    const revokedSessionResponse = await fetch(`${baseUrl}/auth/me`, {
      headers: authorization,
    });
    assert.equal(revokedSessionResponse.status, 401);

    const refreshedLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "TestPassword123!" }),
    });
    assert.equal(refreshedLoginResponse.status, 200);
    const refreshedLogin =
      await readJson<SuccessEnvelope<{ token: string }>>(refreshedLoginResponse);
    authorization = { authorization: `Bearer ${refreshedLogin.data.token}` };

    const reRegisteredDeviceResponse = await fetch(`${baseUrl}/devices`, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        identificador_unico: `new-after-delete-${randomUUID()}`,
        tipo_dispositivo: "BROWSER",
        sistema_operativo: "Test",
        navegador: "Test",
      }),
    });
    assert.equal(reRegisteredDeviceResponse.status, 201);
    const reRegisteredDevice = await readJson<SuccessEnvelope<{ confiable: boolean }>>(
      reRegisteredDeviceResponse,
    );
    assert.equal(reRegisteredDevice.data.confiable, false);

    await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { password_hash: await bcrypt.hash("UpdatedPassword123!", 10) },
    });

    const finalAuditResponse = await fetch(`${baseUrl}/audit?limit=50`, {
      headers: authorization,
    });
    assert.equal(finalAuditResponse.status, 200);
    const finalAuditHistory =
      await readJson<SuccessEnvelope<{ items: Array<{ tipo_accion: string }> }>>(
        finalAuditResponse,
      );
    for (const action of [
      "ALERTA_FRAUDE_RESUELTA",
      "DISPOSITIVO_MARCADO_NO_CONFIABLE",
      "DISPOSITIVO_ELIMINADO",
      "CAMBIO_PASSWORD",
    ]) {
      assert.ok(finalAuditHistory.data.items.some((event) => event.tipo_accion === action));
    }

    const userForReset = await prisma.usuario.findUniqueOrThrow({
      where: { id_usuario: userId },
      select: { password_hash: true },
    });
    const jwtSecret = process.env.JWT_SECRET;
    assert.ok(jwtSecret);
    const resetToken = createPasswordResetToken(userId, userForReset.password_hash, jwtSecret);
    const verifyResetResponse = await fetch(`${baseUrl}/auth/verify-reset-token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: resetToken }),
    });
    assert.equal(verifyResetResponse.status, 200);
    assert.equal(
      (await readJson<SuccessEnvelope<{ valid: boolean }>>(verifyResetResponse)).data.valid,
      true,
    );

    const resetPasswordResponse = await fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        password_nueva: "NewPassword123!",
      }),
    });
    assert.equal(resetPasswordResponse.status, 200);

    const reusedResetTokenResponse = await fetch(`${baseUrl}/auth/verify-reset-token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: resetToken }),
    });
    assert.equal(reusedResetTokenResponse.status, 401);
    const invalidatedAuthorizationResponse = await fetch(`${baseUrl}/auth/me`, {
      headers: authorization,
    });
    assert.equal(invalidatedAuthorizationResponse.status, 401);

    const resetLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "NewPassword123!" }),
    });
    assert.equal(resetLoginResponse.status, 200);
    const resetLogin = await readJson<SuccessEnvelope<{ token: string }>>(resetLoginResponse);
    const resetAuthorization = {
      authorization: `Bearer ${resetLogin.data.token}`,
    };
    const authenticatedAfterResetResponse = await fetch(`${baseUrl}/auth/me`, {
      headers: resetAuthorization,
    });
    assert.equal(authenticatedAfterResetResponse.status, 200);

    for (const [index, expectedStatus] of [401, 401, 423].entries()) {
      const failedAttemptResponse = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password: "IncorrectPassword123!" }),
      });
      assert.equal(failedAttemptResponse.status, expectedStatus, `failed attempt ${index + 1}`);
      if (expectedStatus === 423) {
        const lockedError = await readJson<FailureEnvelope>(failedAttemptResponse);
        assert.equal(lockedError.error.code, "ACCOUNT_LOCKED");
      }
    }

    const lockState = await prisma.$queryRaw<
      Array<{
        intentos_login_fallidos: number;
        bloqueado_hasta: Date | null;
        database_now: Date;
      }>
    >`
      SELECT intentos_login_fallidos, bloqueado_hasta, NOW() AS database_now
      FROM trida.usuarios
      WHERE id_usuario = ${userId}
    `;
    assert.equal(lockState[0]?.intentos_login_fallidos, 3);
    assert.ok(lockState[0]?.bloqueado_hasta);
    assert.ok(
      lockState[0].bloqueado_hasta.getTime() > lockState[0].database_now.getTime() + 59 * 60 * 1000,
    );

    const correctPasswordWhileLocked = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "NewPassword123!" }),
    });
    assert.equal(correctPasswordWhileLocked.status, 423);
  } finally {
    try {
      const userIds = [userId, otherUserId].filter((id): id is number => id !== undefined);
      if (userIds.length > 0) {
        await prisma.usuario.deleteMany({ where: { id_usuario: { in: userIds } } });
      }
    } finally {
      try {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      } finally {
        await prisma.$disconnect();
      }
    }
  }
});
