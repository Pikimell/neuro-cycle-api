import { Router } from "express";
import { CrudControllers } from "../controllers/crudControllerFactory.js";

export const createCrudRouter = ({
  create,
  getAll,
  getById,
  updateById,
  deleteById,
}: CrudControllers) => {
  const router = Router();

  router.post("/", create);
  router.get("/", getAll);
  router.get("/:id", getById);
  router.patch("/:id", updateById);
  router.delete("/:id", deleteById);

  return router;
};
