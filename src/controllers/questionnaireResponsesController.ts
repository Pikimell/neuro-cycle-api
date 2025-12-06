import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, {
  createQuestionnaireResponseForPatient,
  getQuestionnaireResponsesForPatient,
} from "../services/questionnaireResponsesService.js";
import { requirePatientForUser } from "../helpers/patientContext.js";

const controllers = createCrudControllers(service);

export const createQuestionnaireResponseController = controllers.create;
export const getAllQuestionnaireResponsesController = controllers.getAll;
export const getQuestionnaireResponseByIdController = controllers.getById;
export const updateQuestionnaireResponseByIdController = controllers.updateById;
export const deleteQuestionnaireResponseByIdController = controllers.deleteById;

export const submitQuestionnaireResponseController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const payload = {
      ...req.body,
      patientId: patient._id,
      startedAt: req.body?.startedAt ? new Date(req.body.startedAt) : new Date(),
      completedAt: req.body?.completedAt ? new Date(req.body.completedAt) : undefined,
    };
    const result = await createQuestionnaireResponseForPatient(payload);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyQuestionnaireResponsesController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const responses = await getQuestionnaireResponsesForPatient(patient._id.toString(), from, to);
    res.status(200).json(responses);
  } catch (err) {
    next(err);
  }
};
