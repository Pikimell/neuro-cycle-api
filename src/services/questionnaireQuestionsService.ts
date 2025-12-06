import { QuestionnaireQuestionCollection, type QuestionnaireQuestion } from "../database/models/questionnaireQuestions.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<QuestionnaireQuestion>(QuestionnaireQuestionCollection, "Questionnaire question");

export const createQuestionnaireQuestion = service.create;
export const getAllQuestionnaireQuestions = service.getAll;
export const getQuestionnaireQuestionById = service.getById;
export const updateQuestionnaireQuestionById = service.updateById;
export const deleteQuestionnaireQuestionById = service.deleteById;

export default service;
