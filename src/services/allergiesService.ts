import { AllergyCollection, type Allergy } from "../database/models/allergies.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<Allergy>(AllergyCollection, "Allergy");

export const createAllergy = service.create;
export const getAllAllergies = service.getAll;
export const getAllergyById = service.getById;
export const updateAllergyById = service.updateById;
export const deleteAllergyById = service.deleteById;

export default service;
