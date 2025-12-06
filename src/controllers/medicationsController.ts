import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, { getMedicationsForPatient } from "../services/medicationsService.js";
import { requirePatientForUser } from "../helpers/patientContext.js";

const controllers = createCrudControllers(service);

export const createMedicationController = controllers.create;
export const getAllMedicationsController = controllers.getAll;
export const getMedicationByIdController = controllers.getById;
export const updateMedicationByIdController = controllers.updateById;
export const deleteMedicationByIdController = controllers.deleteById;

export const getMyMedicationsController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const meds = await getMedicationsForPatient(patient._id.toString());
    res.status(200).json(meds);
  } catch (err) {
    next(err);
  }
};
