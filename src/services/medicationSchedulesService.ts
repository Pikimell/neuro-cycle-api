import {
  MedicationScheduleCollection,
  type MedicationSchedule,
} from "../database/models/medicationSchedules.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<MedicationSchedule>(
  MedicationScheduleCollection,
  "Medication schedule"
);

export const createMedicationSchedule = service.create;
export const getAllMedicationSchedules = () => {
  return MedicationScheduleCollection.find({ isActive: { $ne: false } });
};

export const getMedicationScheduleById = (id: string, patientId?: string) => {
  const filter: Record<string, unknown> = { _id: id, isActive: { $ne: false } };
  if (patientId) {
    filter.patientId = patientId;
  }
  return MedicationScheduleCollection.findOne(filter);
};

export const updateMedicationScheduleById = (
  id: string,
  payload: Partial<MedicationSchedule>,
  patientId?: string
) => {
  const filter: Record<string, unknown> = { _id: id };
  if (patientId) {
    filter.patientId = patientId;
  }
  return MedicationScheduleCollection.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true,
  });
};

export const deleteMedicationScheduleById = (id: string, patientId?: string) => {
  const filter: Record<string, unknown> = { _id: id };
  if (patientId) {
    filter.patientId = patientId;
  }
  return MedicationScheduleCollection.findOneAndUpdate(
    filter,
    { isActive: false },
    { new: true, runValidators: true }
  );
};

export const getMedicationSchedulesForPatient = (patientId: string) => {
  return MedicationScheduleCollection.find({
    patientId,
    isActive: { $ne: false },
  }).sort({
    startDate: -1,
    createdAt: -1,
  });
};

export const getMedicationSchedulesActiveInRange = (
  patientId: string,
  rangeStart: Date,
  rangeEnd: Date
) => {
  return MedicationScheduleCollection.find({
    patientId,
    isActive: { $ne: false },
    startDate: { $lte: rangeEnd },
    $or: [{ endDate: null }, { endDate: { $gte: rangeStart } }],
  }).sort({
    startDate: -1,
    createdAt: -1,
  });
};

export default service;
