import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, { getPatientByUserId, getPatientSummary } from "../services/patientsService.js";
import { requirePatientForUser } from "../helpers/patientContext.js";

const controllers = createCrudControllers(service);

export const createPatientController = controllers.create;
export const getAllPatientsController = controllers.getAll;
export const getPatientByIdController = controllers.getById;
export const updatePatientByIdController = controllers.updateById;
export const deletePatientByIdController = controllers.deleteById;

export const getCurrentPatientController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await getPatientByUserId(user._id.toString());
    if (!patient) {
      throw createHttpError(404, "Patient profile not found");
    }
    res.status(200).json(patient);
  } catch (err) {
    next(err);
  }
};

export const getPatientSummaryController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }

    const patientId = req.params.id;
    if (!patientId) {
      throw createHttpError(400, "Patient id is required");
    }

    const summary = await getPatientSummary(patientId);
    if (!summary.patient) {
      throw createHttpError(404, "Patient not found");
    }

    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};

export const getMyPatientSummaryController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const summary = await getPatientSummary(patient._id.toString());
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};
