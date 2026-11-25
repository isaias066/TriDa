import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { accountService } from "./accounts.service.js";
import { createAccountSchema, updateAccountSchema } from "./accounts.schemas.js";
import { parseId } from "../../utils/params.js";

export class AccountsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const accounts = await accountService.list(userId);

      sendSuccess(res, accounts);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const accountId = parseId(req.params.id);
      const account = await accountService.getById(userId, accountId);

      sendSuccess(res, account);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const data = createAccountSchema.parse(req.body);
      const created = await accountService.create(userId, data);

      sendSuccess(res, created, "Cuenta creada exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const accountId = parseId(req.params.id);
      const data = updateAccountSchema.parse(req.body);
      const updated = await accountService.update(userId, accountId, data);

      sendSuccess(res, updated, "Cuenta actualizada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const accountId = parseId(req.params.id);
      const result = await accountService.deactivate(userId, accountId);

      sendSuccess(res, result, "Cuenta desactivada exitosamente");
    } catch (error) {
      next(error);
    }
  }

}

export const accountsController = new AccountsController();
export const accountController = accountsController;
