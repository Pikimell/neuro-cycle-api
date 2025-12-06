import { MedicationReminderCollection, type MedicationReminder } from "../database/models/medicationReminders.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<MedicationReminder>(MedicationReminderCollection, "Medication reminder");

export const createMedicationReminder = service.create;
export const getAllMedicationReminders = service.getAll;
export const getMedicationReminderById = service.getById;
export const updateMedicationReminderById = service.updateById;
export const deleteMedicationReminderById = service.deleteById;

export const markMedicationReminderTaken = (id: string, at = new Date()) => {
  return MedicationReminderCollection.findByIdAndUpdate(
    id,
    { lastTakenAt: at },
    { new: true, runValidators: true }
  );
};

export const markMedicationReminderMissed = (id: string) => {
  return MedicationReminderCollection.findByIdAndUpdate(
    id,
    { lastTakenAt: null },
    { new: true, runValidators: true }
  );
};

export default service;
