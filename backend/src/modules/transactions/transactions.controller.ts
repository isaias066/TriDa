import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { transactionsService } from "./transactions.service.js";
import { parseId } from "../../utils/params.js";
import {
  createTransactionSchema,
  emailTransactionConfirmationSchema,
  externalTransactionSchema,
  listTransactionsQuerySchema,
  transactionConfirmationTokenSchema,
  updateTransactionCategorySchema,
  updateTransactionStatusSchema,
} from "./transactions.schemas.js";

export class TransactionsController {
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const queryObj = listTransactionsQuerySchema.parse(req.query);

      const result = await transactionsService.list(userId, queryObj);

      sendSuccess(res, {
        items: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const transactionId = parseId(req.params.id);

      const transaction = await transactionsService.getById(userId, transactionId);

      sendSuccess(res, transaction);
    } catch (error) {
      next(error);
    }
  }

  async getCountsByLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const counts = await transactionsService.countsByLevel(userId);

      sendSuccess(res, counts);
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const data = createTransactionSchema.parse(req.body);
      const created = await transactionsService.create(userId, data);

      sendSuccess(
        res,
        {
          transaction: created.transaction,
          evaluation: created.evaluation,
          alert: created.alert,
        },
        "Transacción registrada exitosamente",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const transactionId = parseId(req.params.id);

      await transactionsService.delete(userId, transactionId);
      sendSuccess(res, { id_transaccion: transactionId }, "Transacción eliminada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  async prepareTransactionArchive(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await transactionsService.prepareTransactionArchive(req.user!.id_usuario);
      sendSuccess(res, result, "Período de retención preparado");
    } catch (error) {
      next(error);
    }
  }

  async downloadTransactionArchive(req: Request, res: Response, next: NextFunction) {
    try {
      const exportId = parseId(req.params.exportId);
      const archive = await transactionsService.downloadTransactionArchive(
        req.user!.id_usuario,
        exportId,
      );
      res
        .status(200)
        .set({
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${archive.filename}"`,
          "Cache-Control": "no-store",
        })
        .send(archive.csv);
    } catch (error) {
      next(error);
    }
  }

  async purgeTransactionArchive(req: Request, res: Response, next: NextFunction) {
    try {
      const exportId = parseId(req.params.exportId);
      const result = await transactionsService.purgeTransactionArchive(
        req.user!.id_usuario,
        exportId,
      );
      sendSuccess(res, result, "Eliminación anual de movimientos completada");
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const transactionId = parseId(req.params.id);
      const { estado } = updateTransactionStatusSchema.parse(req.body);
      const updated = await transactionsService.updateStatus(userId, transactionId, estado);

      sendSuccess(res, updated, "Estado de transacción actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const transactionId = parseId(req.params.id);
      const { id_categoria } = updateTransactionCategorySchema.parse(req.body);
      const updated = await transactionsService.updateCategory(userId, transactionId, id_categoria);
      sendSuccess(res, updated, "Categoría de transacción actualizada");
    } catch (error) {
      next(error);
    }
  }

  async getEmailConfirmation(req: Request, res: Response, next: NextFunction) {
    res.setHeader("Cache-Control", "no-store");
    try {
      const { token } = transactionConfirmationTokenSchema.parse(req.query);
      const confirmation = await transactionsService.getEmailConfirmation(token);
      sendSuccess(res, confirmation);
    } catch (error) {
      next(error);
    }
  }

  async resolveEmailConfirmation(req: Request, res: Response, next: NextFunction) {
    res.setHeader("Cache-Control", "no-store");
    try {
      const { token, decision } = emailTransactionConfirmationSchema.parse(req.body);
      const result = await transactionsService.resolveEmailConfirmation(token, decision);
      sendSuccess(res, result, "Respuesta de confirmación registrada");
    } catch (error) {
      next(error);
    }
  }

  async ingestExternalTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const data = externalTransactionSchema.parse(req.body);
      const result = await transactionsService.ingestExternalTransaction(data);
      sendSuccess(
        res,
        {
          id_transaccion: result.transaction.id_transaccion,
          estado: result.transaction.estado,
          duplicado: result.duplicate,
          archivado: result.archived,
        },
        result.duplicate ? "El evento ya había sido procesado" : "Movimiento externo recibido",
        result.duplicate ? 200 : 201,
      );
    } catch (error) {
      next(error);
    }
  }

  // Alias para mantener compatibilidad con cualquier variante de nombre en rutas
  list = this.getTransactions.bind(this);
  getById = this.getTransactionById.bind(this);
  countsByLevel = this.getCountsByLevel.bind(this);
  create = this.createTransaction.bind(this);
  delete = this.deleteTransaction.bind(this);
  prepareArchive = this.prepareTransactionArchive.bind(this);
  downloadArchive = this.downloadTransactionArchive.bind(this);
  purgeArchive = this.purgeTransactionArchive.bind(this);
  changeStatus = this.updateStatus.bind(this);
  changeCategory = this.updateCategory.bind(this);
  confirmEmail = this.resolveEmailConfirmation.bind(this);
  getEmailConfirmationDetails = this.getEmailConfirmation.bind(this);
  ingestExternal = this.ingestExternalTransaction.bind(this);
}

export const transactionsController = new TransactionsController();
