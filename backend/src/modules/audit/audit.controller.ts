import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { auditHistoryQuerySchema } from "./audit.schemas.js";
import { auditService } from "./audit.service.js";

export const auditController = {
  async getOwnHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const query = auditHistoryQuerySchema.parse(req.query);
      const result = await auditService.getOwnHistory(req.user!.id_usuario, query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
