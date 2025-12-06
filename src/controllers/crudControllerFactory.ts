import { RequestHandler } from "express";
import { CrudService } from "../services/crudServiceFactory.js";

export type CrudControllers = {
  create: RequestHandler;
  getAll: RequestHandler;
  getById: RequestHandler;
  updateById: RequestHandler;
  deleteById: RequestHandler;
};

export const createCrudControllers = <TRaw>(
  service: CrudService<TRaw>
): CrudControllers => ({
  create: async (req, res, next) => {
    try {
      const result = await service.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
  getAll: async (_req, res, next) => {
    try {
      const result = await service.getAll();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await service.getById(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
  updateById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await service.updateById(id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
  deleteById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await service.deleteById(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
});
