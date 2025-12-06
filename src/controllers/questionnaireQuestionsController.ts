import { createCrudControllers } from "./crudControllerFactory.js";
import service from "../services/questionnaireQuestionsService.js";

const controllers = createCrudControllers(service);

export const createQuestionnaireQuestionController = controllers.create;
export const getAllQuestionnaireQuestionsController = controllers.getAll;
export const getQuestionnaireQuestionByIdController = controllers.getById;
export const updateQuestionnaireQuestionByIdController = controllers.updateById;
export const deleteQuestionnaireQuestionByIdController = controllers.deleteById;
