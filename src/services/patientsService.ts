import { PatientCollection, type Patient } from "../database/models/patients.js";
import { createCrudService } from "./crudServiceFactory.js";
import { AllergyCollection } from "../database/models/allergies.js";
import { ChronicConditionCollection } from "../database/models/chronicConditions.js";
import { SpecialConsiderationsCollection } from "../database/models/specialConsiderations.js";
import { Types } from "mongoose";

const service = createCrudService<Patient>(PatientCollection, "Patient");

export const createPatient = service.create;
export const getAllPatients = service.getAll;
export const getPatientById = service.getById;
export const updatePatientById = service.updateById;
export const deletePatientById = service.deleteById;

export const getPatientByUserId = (userId: string) => PatientCollection.findOne({ userId });

export const getPatientSummary = async (patientId: string) => {
  const [patient, allergies, chronicConditions, specialConsiderations] = await Promise.all([
    PatientCollection.findById(patientId),
    AllergyCollection.find({ patientId, visibleToDoctor: true }),
    ChronicConditionCollection.find({ patientId, visibleToDoctor: true }),
    SpecialConsiderationsCollection.find({ patientId, visibleToDoctor: true }),
  ]);

  return {
    patient,
    allergies,
    chronicConditions,
    specialConsiderations,
  };
};

export const assignDoctorToPatient = (patientId: string, doctorId: string) => {
  return PatientCollection.findByIdAndUpdate(
    patientId,
    { assignedDoctorId: new Types.ObjectId(doctorId) },
    { new: true }
  );
};

export default service;
