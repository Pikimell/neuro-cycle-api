import { MedicationCollection, type Medication } from "../database/models/medications.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<Medication>(MedicationCollection, "Medication");

export const createMedication = service.create;
export const getAllMedications = service.getAll;
export const getMedicationById = service.getById;
export const updateMedicationById = service.updateById;
export const deleteMedicationById = service.deleteById;

export default service;
