import { createCrudControllers } from "./crudControllerFactory.js";
import service from "../services/specialConsiderationsService.js";

const controllers = createCrudControllers(service);

export const createSpecialConsiderationsController = controllers.create;
export const getAllSpecialConsiderationsController = controllers.getAll;
export const getSpecialConsiderationsByIdController = controllers.getById;
export const updateSpecialConsiderationsByIdController = controllers.updateById;
export const deleteSpecialConsiderationsByIdController = controllers.deleteById;
