import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { categoryService } from "./category.service.js";
import { createCategorySchema, updateCategorySchema } from "./category.schemas.js";
import { parseId } from "../../utils/params.js";

export class CategoriesController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const categories = await categoryService.list(userId);

      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const categoryId = parseId(req.params.id);
      const category = await categoryService.getById(userId, categoryId);

      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const data = createCategorySchema.parse(req.body);
      const created = await categoryService.create(userId, data);

      sendSuccess(res, created, "Categoría creada exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const categoryId = parseId(req.params.id);
      const data = updateCategorySchema.parse(req.body);
      const updated = await categoryService.update(userId, categoryId, data);

      sendSuccess(res, updated, "Categoría actualizada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const categoryId = parseId(req.params.id);
      await categoryService.delete(userId, categoryId);

      sendSuccess(res, { id_categoria: categoryId }, "Categoría eliminada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  // Alias mediante arrow functions para mantener el contexto 'this' y resolver cualquier nombre de método llamado por las rutas
  getCategories = (req: Request, res: Response, next: NextFunction) => this.list(req, res, next);

  getCategoryById = (req: Request, res: Response, next: NextFunction) =>
    this.getById(req, res, next);

  createCategory = (req: Request, res: Response, next: NextFunction) => this.create(req, res, next);

  updateCategory = (req: Request, res: Response, next: NextFunction) => this.update(req, res, next);

  deleteCategory = (req: Request, res: Response, next: NextFunction) => this.delete(req, res, next);

  deactivate = (req: Request, res: Response, next: NextFunction) => this.delete(req, res, next);

  destroy = (req: Request, res: Response, next: NextFunction) => this.delete(req, res, next);

  remove = (req: Request, res: Response, next: NextFunction) => this.delete(req, res, next);

  removeCategory = (req: Request, res: Response, next: NextFunction) => this.delete(req, res, next);
}

export const categoriesController = new CategoriesController();
export const categoryController = categoriesController;
