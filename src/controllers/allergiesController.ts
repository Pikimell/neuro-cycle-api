import { createCrudControllers } from "./crudControllerFactory.js";
import service from "../services/allergiesService.js";

const controllers = createCrudControllers(service);

export const createAllergyController = controllers.create;
export const getAllAllergiesController = controllers.getAll;
export const getAllergyByIdController = controllers.getById;
export const updateAllergyByIdController = controllers.updateById;
export const deleteAllergyByIdController = controllers.deleteById;
