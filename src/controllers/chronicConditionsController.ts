import { createCrudControllers } from "./crudControllerFactory.js";
import service from "../services/chronicConditionsService.js";

const controllers = createCrudControllers(service);

export const createChronicConditionController = controllers.create;
export const getAllChronicConditionsController = controllers.getAll;
export const getChronicConditionByIdController = controllers.getById;
export const updateChronicConditionByIdController = controllers.updateById;
export const deleteChronicConditionByIdController = controllers.deleteById;
