import { QuestionnaireResponseCollection, type QuestionnaireResponse } from "../database/models/questionnaireResponses.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<QuestionnaireResponse>(QuestionnaireResponseCollection, "Questionnaire response");

export const createQuestionnaireResponse = service.create;
export const getAllQuestionnaireResponses = service.getAll;
export const getQuestionnaireResponseById = service.getById;
export const updateQuestionnaireResponseById = service.updateById;
export const deleteQuestionnaireResponseById = service.deleteById;

export const createQuestionnaireResponseForPatient = (payload: QuestionnaireResponse) => {
  return QuestionnaireResponseCollection.create(payload);
};

export const getQuestionnaireResponsesForPatient = (patientId: string, from?: Date, to?: Date) => {
  const query: Record<string, unknown> = { patientId };
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.$gte = from;
    if (to) range.$lte = to;
    query.createdAt = range;
  }
  return QuestionnaireResponseCollection.find(query).sort({ createdAt: -1 });
};

export default service;
