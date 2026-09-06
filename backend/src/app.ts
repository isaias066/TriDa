import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import ingestRoutes from "./modules/ingest/ingest.routes.js";

import authRoutes from "./modules/auth/auth.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import transactionsRoutes from "./modules/transactions/transactions.routes.js";
import alertsRoutes from "./modules/alerts/alerts.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import mapRoutes from "./modules/map/map.routes.js";
import banksRoutes from "./modules/banks/banks.routes.js";
import customersRoutes from "./modules/customers/customers.routes.js";
import devicesRoutes from "./modules/devices/devices.routes.js";
import usersRoutes from "./modules/users/users.routes.js";

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api", apiRateLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/banks", banksRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/users", usersRoutes);

// Alias
app.use("/api/transacciones", transactionsRoutes);
app.use("/api/alertas", alertsRoutes);
app.use("/api/bancos", banksRoutes);
app.use("/api/dispositivos", devicesRoutes);
app.use("/api/tareas", customersRoutes);
app.use("/api/usuarios", customersRoutes);
app.use("/api/mapa", mapRoutes);
app.use("/api/v1/ingest", ingestRoutes);

app.use(errorHandler);

export default app;
