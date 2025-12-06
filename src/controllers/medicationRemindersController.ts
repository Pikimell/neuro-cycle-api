import createHttpError from "http-errors";
import { RequestHandler } from "express";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, {
  markMedicationReminderTaken,
  markMedicationReminderMissed,
} from "../services/medicationRemindersService.js";

const controllers = createCrudControllers(service);

export const createMedicationReminderController = controllers.create;
export const getAllMedicationRemindersController = controllers.getAll;
export const getMedicationReminderByIdController = controllers.getById;
export const updateMedicationReminderByIdController = controllers.updateById;
export const deleteMedicationReminderByIdController = controllers.deleteById;

export const markMedicationReminderTakenController: RequestHandler = async (req, res, next) => {
  try {
    const result = await markMedicationReminderTaken(req.params.id);
    if (!result) {
      throw createHttpError(404, "Medication reminder not found");
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const markMedicationReminderMissedController: RequestHandler = async (req, res, next) => {
  try {
    const result = await markMedicationReminderMissed(req.params.id);
    if (!result) {
      throw createHttpError(404, "Medication reminder not found");
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
