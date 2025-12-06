import { DoctorCollection, type Doctor } from "../database/models/doctors.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<Doctor>(DoctorCollection, "Doctor");

export const createDoctor = service.create;
export const getAllDoctors = service.getAll;
export const getDoctorById = service.getById;
export const updateDoctorById = service.updateById;
export const deleteDoctorById = service.deleteById;

export const getDoctorByUserId = (userId: string) => {
  return DoctorCollection.findOne({ userId });
};

export const getDoctorAvailability = async (id: string) => {
  const doctor = await DoctorCollection.findById(id, { workingHours: 1, fullName: 1, clinic: 1, phone: 1, email: 1 });
  return doctor;
};

export default service;
