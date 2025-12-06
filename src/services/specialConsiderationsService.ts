import { SpecialConsiderationsCollection, type SpecialConsiderations } from "../database/models/specialConsiderations.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<SpecialConsiderations>(SpecialConsiderationsCollection, "Special considerations");

export const createSpecialConsiderations = service.create;
export const getAllSpecialConsiderations = service.getAll;
export const getSpecialConsiderationsById = service.getById;
export const updateSpecialConsiderationsById = service.updateById;
export const deleteSpecialConsiderationsById = service.deleteById;

export default service;
