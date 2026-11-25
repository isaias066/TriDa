import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { insightsService } from "./insights.service.js";
import { insightsQuerySchema } from "./insights.schemas.js";

const IA_SERVICE_URL = process.env.IA_SERVICE_URL || "http://127.0.0.1:5000";

const scanMessageSchema = z.object({
  texto: z.string().trim().min(3, "Ingresa un mensaje o enlace para analizar").max(2000),
});

export const insightsController = {
  async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const { periodo_dias, id_cuenta } = insightsQuerySchema.parse(req.query);
      const data = await insightsService.getInsights(userId, periodo_dias, id_cuenta);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async scanMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { texto } = scanMessageSchema.parse(req.body);
      const response = await fetch(`${IA_SERVICE_URL}/api/ia/analizar-enlace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(1500),
        body: JSON.stringify({ texto }),
      });

      if (!response.ok) {
        throw new AppError("El motor de análisis IA no respondió correctamente", 502);
      }

      const result = await response.json();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
