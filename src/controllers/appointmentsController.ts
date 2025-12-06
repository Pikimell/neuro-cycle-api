import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, { respondToAppointment, getAppointmentsForUser } from "../services/appointmentsService.js";
import { requirePatientForUser, requireDoctorForUser } from "../helpers/patientContext.js";

const controllers = createCrudControllers(service);

export const createAppointmentController = controllers.create;
export const getAllAppointmentsController = controllers.getAll;
export const getAppointmentByIdController = controllers.getById;
export const updateAppointmentByIdController = controllers.updateById;
export const deleteAppointmentByIdController = controllers.deleteById;

export const respondToAppointmentController: RequestHandler = async (req, res, next) => {
  try {
    const result = await respondToAppointment(req.params.id, req.body);
    if (!result) {
      throw createHttpError(404, "Appointment not found");
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyAppointmentsController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }

    let patientId: string | undefined;
    let doctorId: string | undefined;

    if (user.role === "DOCTOR") {
      const doctor = await requireDoctorForUser(user);
      doctorId = doctor._id.toString();
    } else {
      const patient = await requirePatientForUser(user);
      patientId = patient._id.toString();
    }

    const result = await getAppointmentsForUser({ patientId, doctorId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
