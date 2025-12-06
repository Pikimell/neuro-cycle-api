import { AppointmentCollection, type Appointment } from "../database/models/appointments.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<Appointment>(AppointmentCollection, "Appointment");

export const createAppointment = service.create;
export const getAllAppointments = service.getAll;
export const getAppointmentById = service.getById;
export const updateAppointmentById = service.updateById;
export const deleteAppointmentById = service.deleteById;

type AppointmentStatus = Appointment["status"];

export const respondToAppointment = (
  id: string,
  payload: Partial<Appointment> & { status?: AppointmentStatus }
) => {
  return AppointmentCollection.findByIdAndUpdate(
    id,
    {
      ...payload,
      status: payload.status ?? "CONFIRMED",
    },
    { new: true, runValidators: true }
  );
};

export const getAppointmentsForUser = (params: { patientId?: string; doctorId?: string }) => {
  const { patientId, doctorId } = params;
  const query: Record<string, unknown> = {};
  if (patientId) query.patientId = patientId;
  if (doctorId) query.doctorId = doctorId;
  return AppointmentCollection.find(query).sort({ requestedAt: -1, createdAt: -1 });
};

export default service;
