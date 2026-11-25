import { AsyncLocalStorage } from "node:async_hooks";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  event: string;
  message?: string;
  context?: Record<string, unknown>;
  error?: { name: string };
}

export interface LoggerOptions {
  service: string;
  minLevel?: LogLevel;
  baseContext?: Record<string, unknown>;
}

const requestContext = new AsyncLocalStorage<string>();

const getErrorName = (err: unknown): string => {
  if (err instanceof Error) {
    return err.name;
  }
  if (typeof err === "object" && err !== null && "name" in err) {
    return typeof err.name === "string" ? err.name : "UnknownError";
  }
  return "UnknownError";
};

export class Logger {
  private readonly service: string;
  private readonly minLevel: LogLevel;
  private readonly baseContext: Record<string, unknown>;

  constructor(options: LoggerOptions) {
    this.service = options.service;
    this.minLevel = options.minLevel ?? "info";
    this.baseContext = options.baseContext ?? {};
  }

  child(context: Record<string, unknown>): Logger {
    return new Logger({
      service: this.service,
      minLevel: this.minLevel,
      baseContext: { ...this.baseContext, ...context },
    });
  }

  debug(event: string, context?: Record<string, unknown>): void {
    this.log("debug", event, context);
  }

  info(event: string, context?: Record<string, unknown>): void {
    this.log("info", event, context);
  }

  warn(event: string, context?: Record<string, unknown>): void {
    this.log("warn", event, context);
  }

  error(event: string, err?: unknown, context?: Record<string, unknown>): void {
    this.log("error", event, context, err);
  }

  private log(
    level: LogLevel,
    event: string,
    context?: Record<string, unknown>,
    err?: unknown,
  ): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    const requestId = requestContext.getStore();
    const mergedContext = {
      ...this.baseContext,
      ...(requestId ? { requestId } : {}),
      ...context,
    };
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      event,
      ...(Object.keys(mergedContext).length > 0 ? { context: mergedContext } : {}),
      ...(err !== undefined ? { error: { name: getErrorName(err) } } : {}),
    };
    const line = JSON.stringify(entry);

    if (level === "error" || level === "warn") {
      console.error(line);
    } else {
      console.info(line);
    }
  }
}

export const runWithRequestId = (requestId: string, callback: () => void): void => {
  requestContext.run(requestId, callback);
};

export const logger = new Logger({
  service: "trida-backend",
});
