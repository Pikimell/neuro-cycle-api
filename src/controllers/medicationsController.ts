import { createCrudControllers } from "./crudControllerFactory.js";
import service from "../services/medicationsService.js";

const controllers = createCrudControllers(service);

export const createMedicationController = controllers.create;
export const getAllMedicationsController = controllers.getAll;
export const getMedicationByIdController = controllers.getById;
export const updateMedicationByIdController = controllers.updateById;
export const deleteMedicationByIdController = controllers.deleteById;
