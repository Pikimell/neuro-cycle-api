import { QuestionnaireTemplateCollection, type QuestionnaireTemplate } from "../database/models/questionnaireTemplates.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<QuestionnaireTemplate>(QuestionnaireTemplateCollection, "Questionnaire template");

export const createQuestionnaireTemplate = service.create;
export const getAllQuestionnaireTemplates = service.getAll;
export const getQuestionnaireTemplateById = service.getById;
export const updateQuestionnaireTemplateById = service.updateById;
export const deleteQuestionnaireTemplateById = service.deleteById;

export const getAssignedTemplates = (diagnosisType?: string) => {
  const filters: Record<string, unknown> = { isActive: true };

  if (diagnosisType && diagnosisType !== "NONE") {
    filters.targetCondition = { $in: [diagnosisType, "ANY"] };
  }

  return QuestionnaireTemplateCollection.find(filters);
};

export default service;
