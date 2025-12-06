import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, { getAssignedTemplates } from "../services/questionnaireTemplatesService.js";
import { requirePatientForUser } from "../helpers/patientContext.js";

const controllers = createCrudControllers(service);

export const createQuestionnaireTemplateController = controllers.create;
export const getAllQuestionnaireTemplatesController = controllers.getAll;
export const getQuestionnaireTemplateByIdController = controllers.getById;
export const updateQuestionnaireTemplateByIdController = controllers.updateById;
export const deleteQuestionnaireTemplateByIdController = controllers.deleteById;

export const getAssignedQuestionnaireTemplatesController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const templates = await getAssignedTemplates(patient.diagnosisType);
    res.status(200).json(templates);
  } catch (err) {
    next(err);
  }
};
