import {
  MedicationIntakeCollection,
  type MedicationIntake,
} from "../database/models/medicationIntakes.js";

export const getAllMedicationIntakes = () => {
  return MedicationIntakeCollection.find().sort({
    takenAt: -1,
    createdAt: -1,
  });
};

export const createMedicationIntake = (payload: Partial<MedicationIntake>) => {
  return MedicationIntakeCollection.create(payload);
};

export const getMedicationIntakeById = (id: string, patientId?: string) => {
  const filter: Record<string, unknown> = { _id: id };
  if (patientId) {
    filter.patientId = patientId;
  }
  return MedicationIntakeCollection.findOne(filter);
};

export const updateMedicationIntakeById = (
  id: string,
  payload: Partial<MedicationIntake>,
  patientId?: string
) => {
  const filter: Record<string, unknown> = { _id: id };
  if (patientId) {
    filter.patientId = patientId;
  }
  return MedicationIntakeCollection.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true,
  });
};

export const deleteMedicationIntakeById = (id: string, patientId?: string) => {
  const filter: Record<string, unknown> = { _id: id };
  if (patientId) {
    filter.patientId = patientId;
  }
  return MedicationIntakeCollection.findOneAndDelete(filter);
};

export const getMedicationIntakesForPatient = (
  patientId: string,
  from?: Date,
  to?: Date
) => {
  const filter: Record<string, unknown> = { patientId };

  if (from || to) {
    filter.takenAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }

  return MedicationIntakeCollection.find(filter).sort({
    takenAt: -1,
    createdAt: -1,
  });
};

export const getMedicationIntakesForSchedule = (
  scheduleId: string,
  patientId?: string
) => {
  const filter: Record<string, unknown> = { scheduleId };
  if (patientId) {
    filter.patientId = patientId;
  }
  return MedicationIntakeCollection.find(filter).sort({
    takenAt: -1,
    createdAt: -1,
  });
};
