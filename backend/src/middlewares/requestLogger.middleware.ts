import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logger, runWithRequestId } from "../utils/logger.js";

const getLogPath = (req: Parameters<RequestHandler>[0]): string => {
  if (req.route && typeof req.route.path === "string") {
    return `${req.baseUrl}${req.route.path}` || "/";
  }

  const segments = req.path.split("/").filter(Boolean);
  return segments.length > 3 ? `/${segments.slice(0, 3).join("/")}/:unmatched` : req.path;
};

export const requestLogger: RequestHandler = (req, res, next) => {
  const requestId = randomUUID();
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.once("finish", () => {
    logger.info("http.request.completed", {
      requestId,
      method: req.method,
      path: getLogPath(req),
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  runWithRequestId(requestId, next);
};
