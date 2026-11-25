// ¿Qué? Punto de entrada del servidor backend de TriDa v2.
// ¿Para qué? Inicializar la app Express, conectar Prisma y escuchar en el puerto configurado.

import type { Server } from "node:http";
import app from "./app.js";
import { config } from "./config.js";
import { prisma } from "./db/prisma.js";
import { closeMailer } from "./utils/mailer.js";
import { logger } from "./utils/logger.js";
import { authService } from "./modules/auth/auth.service.js";

let httpServer: Server | undefined;
let shutdownRequested = false;
let shutdownPromise: Promise<void> | undefined;
let auditCleanupTimer: NodeJS.Timeout | undefined;

async function purgeExpiredAuditLogs() {
  try {
    const count = await authService.purgeExpiredAuditLogs();
    if (count > 0) {
      logger.info("audit.retention_purged", { count });
    }
  } catch (error) {
    logger.error("audit.retention_purge_failed", error);
  }
}

async function bootstrap() {
  try {
    // Verificar conexión a PostgreSQL
    await prisma.$connect();
    logger.info("database.connected");
    await purgeExpiredAuditLogs();
    auditCleanupTimer = setInterval(() => void purgeExpiredAuditLogs(), 24 * 60 * 60 * 1000);
    auditCleanupTimer.unref();

    if (shutdownRequested) {
      return;
    }

    const port = config.PORT || 3000;

    httpServer = app.listen(port, () => {
      const baseUrl = `http://localhost:${port}`;

      logger.info("server.started", { port });
      logger.info("server.endpoints.begin", {
        separator: "========== ENDPOINTS DISPONIBLES ==========",
      });
      logger.info("server.endpoint", {
        name: "Healthcheck",
        url: `${baseUrl}/health`,
      });
      logger.info("server.endpoint", {
        name: "Readiness",
        url: `${baseUrl}/health/ready`,
      });
      logger.info("server.endpoint", {
        name: "API",
        url: `${baseUrl}/api/v2`,
      });
      if (config.NODE_ENV !== "production") {
        logger.info("server.endpoint", {
          name: "Swagger",
          url: `${baseUrl}/api/docs`,
        });
      }
      logger.info("server.endpoints.end", {
        separator: "============================================",
      });
    });
    httpServer.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        logger.error("server.port_in_use", error, { port });
      } else {
        logger.error("server.listen_failed", error, { port });
      }

      void shutdown("LISTEN_ERROR").then(() => {
        process.exitCode = 1;
      });
    });
  } catch (error) {
    logger.error("server.start_failed", error);
    if (!shutdownRequested) {
      process.exitCode = 1;
    }
  }
}

// Cierre limpio
function shutdown(signal: string): Promise<void> {
  shutdownRequested = true;
  if (shutdownPromise) {
    return shutdownPromise;
  }

  shutdownPromise = (async () => {
    logger.info("server.shutdown_started", { signal });
    let failed = false;

    if (auditCleanupTimer) {
      clearInterval(auditCleanupTimer);
      auditCleanupTimer = undefined;
    }

    try {
      const server = httpServer;
      if (server?.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
    } catch (error) {
      failed = true;
      logger.error("server.http_shutdown_failed", error);
    }

    try {
      await closeMailer();
      logger.info("mailer.closed");
    } catch (error) {
      failed = true;
      logger.error("mailer.shutdown_failed", error);
    }

    try {
      await prisma.$disconnect();
      logger.info("database.disconnected");
    } catch (error) {
      failed = true;
      logger.error("database.shutdown_failed", error);
    }

    process.exitCode = failed ? 1 : 0;
  })();

  return shutdownPromise;
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

void bootstrap();
