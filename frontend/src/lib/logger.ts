type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

const PREFIX = "[UdensFiltri]";

function emit(level: LogLevel, event: string, meta?: LogMeta) {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ...meta,
  };

  if (level === "debug" && process.env.NODE_ENV === "production") {
    return;
  }

  const loggerFn = level === "debug" ? console.debug : console[level];
  loggerFn(`${PREFIX} ${event}`, payload);
}

export const appLogger = {
  debug: (event: string, meta?: LogMeta) => emit("debug", event, meta),
  info: (event: string, meta?: LogMeta) => emit("info", event, meta),
  warn: (event: string, meta?: LogMeta) => emit("warn", event, meta),
  error: (event: string, meta?: LogMeta) => emit("error", event, meta),
};
