// ¿Qué? Manejador global de errores.
// ¿Para qué? Capturar excepciones del sistema y de validación (Zod) antes de enviarlas al cliente.
// ¿Impacto? Cumple RS-007 impidiendo que se filtren detalles técnicos o stack traces.
import { ZodError } from "zod";
export const errorHandler = (err, req, res, _next) => {
    if (err instanceof ZodError) {
        res
            .status(400)
            .json({
            error: "Error de validación",
            details: err.errors.map((e) => e.message),
        });
        return;
    }
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
    const status = err.statusCode || 500;
    res
        .status(status)
        .json({
        error: status === 500 ? "Error interno del servidor." : err.message,
    });
};
//# sourceMappingURL=error.middleware.js.map