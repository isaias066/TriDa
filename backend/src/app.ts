// ¿Qué? Configuración principal de la app Express.
// ¿Para qué? Montar middlewares globales y registrar las rutas de los 13 módulos.

import express, { Request, Response } from "express";
import { prisma } from "./db/prisma.js";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";
import { sendError } from "./utils/apiResponse.js";
import { logger } from "./utils/logger.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

// Importación de módulos
import authRoutes from "./modules/auth/auth.routes.js";
import accountRoutes from "./modules/account/accounts.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import transactionRoutes from "./modules/transactions/transactions.routes.js";
import transactionIntegrationRoutes from "./modules/transactions/integrations.routes.js";
import deviceRoutes from "./modules/devices/devices.routes.js";
import alertRoutes from "./modules/alerts/alerts.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import budgetRoutes from "./modules/budgets/budgets.routes.js";
import savingsRoutes from "./modules/savings/savings.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import insightsRoutes from "./modules/insights/insights.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import mapRoutes from "./modules/maps/maps.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";

const app = express();
app.set("trust proxy", config.TRUST_PROXY);

// Middlewares globales
app.use(requestLogger);
app.use(
  helmet({
    contentSecurityPolicy:
      config.NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'none'"],
              baseUri: ["'none'"],
              frameAncestors: ["'none'"],
              objectSrc: ["'none'"],
              formAction: ["'none'"],
              scriptSrc: ["'none'"],
              styleSrc: ["'none'"],
              imgSrc: ["'none'"],
              connectSrc: ["'none'"],
            },
          }
        : false,
  }),
);
app.use(
  cors({
    origin: config.FRONTEND_URL || "http://localhost:5173",
    exposedHeaders: ["X-Request-Id"],
  }),
);
app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, body) => {
      (req as Request & { rawBody?: Buffer }).rawBody = Buffer.isBuffer(body)
        ? body
        : Buffer.from(JSON.stringify(body));
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.use(apiRateLimiter);

// Healthcheck
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "trida-backend", version: "2.0.0" });
});

app.get("/health/ready", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", service: "trida-backend", version: "2.0.0" });
  } catch (error) {
    logger.error("database.readiness_check_failed", error, {
      requestId: res.locals.requestId ?? "unknown",
      method: _req.method,
      path: _req.path,
    });
    res.status(503).json({
      status: "not_ready",
      service: "trida-backend",
      version: "2.0.0",
    });
  }
});

// Rutas de API v2
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/accounts", accountRoutes);
app.use("/api/v2/categories", categoryRoutes);
app.use("/api/v2/transactions", transactionRoutes);
app.use("/api/v2/integrations", transactionIntegrationRoutes);
app.use("/api/v2/devices", deviceRoutes);
app.use("/api/v2/alerts", alertRoutes);
app.use("/api/v2/dashboard", dashboardRoutes);
app.use("/api/v2/budgets", budgetRoutes);
app.use("/api/v2/savings", savingsRoutes);
app.use("/api/v2/profile", profileRoutes);
app.use("/api/v2/insights", insightsRoutes);
app.use("/api/v2/reports", reportsRoutes);
app.use("/api/v2/map", mapRoutes);
app.use("/api/v2/audit", auditRoutes);

if (config.NODE_ENV !== "production") {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "TriDa API v2 Docs",
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });
}

// Manejo de ruta no encontrada (404)
app.use((_req: Request, res: Response) => {
  sendError(res, "Ruta no encontrada", 404, null, "ROUTE_NOT_FOUND");
});

// Manejo global de errores (errorHandler)
app.use(errorHandler);

export default app;
