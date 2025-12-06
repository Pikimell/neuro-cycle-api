import createHttpError from "http-errors";
import { PatientCollection, type PatientDocument } from "../database/models/patients.js";
import { DoctorCollection, type DoctorDocument } from "../database/models/doctors.js";
import type { UserDocument } from "../database/models/user.js";

export const requirePatientForUser = async (user: UserDocument): Promise<PatientDocument> => {
  const patient = await PatientCollection.findOne({ userId: user._id });
  if (!patient) {
    throw createHttpError(404, "Patient profile not found");
  }
  return patient;
};

export const requireDoctorForUser = async (user: UserDocument): Promise<DoctorDocument> => {
  const doctor = await DoctorCollection.findOne({ userId: user._id });
  if (!doctor) {
    throw createHttpError(404, "Doctor profile not found");
  }
  return doctor;
};
