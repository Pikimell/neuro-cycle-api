import { ChronicConditionCollection, type ChronicCondition } from "../database/models/chronicConditions.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<ChronicCondition>(ChronicConditionCollection, "Chronic condition");

export const createChronicCondition = service.create;
export const getAllChronicConditions = service.getAll;
export const getChronicConditionById = service.getById;
export const updateChronicConditionById = service.updateById;
export const deleteChronicConditionById = service.deleteById;

export default service;
