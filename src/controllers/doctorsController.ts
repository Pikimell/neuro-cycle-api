import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, { getDoctorByUserId, getDoctorAvailability, getDoctorByCode } from "../services/doctorsService.js";
import { requireDoctorForUser } from "../helpers/patientContext.js";
import { assignDoctorToPatient, getPatientByUserId } from "../services/patientsService.js";

const controllers = createCrudControllers(service);

export const createDoctorController = controllers.create;
export const getAllDoctorsController = controllers.getAll;
export const getDoctorByIdController = controllers.getById;
export const updateDoctorByIdController = controllers.updateById;
export const deleteDoctorByIdController = controllers.deleteById;

export const getCurrentDoctorController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const doctor = await getDoctorByUserId(user._id.toString());
    if (!doctor) {
      throw createHttpError(404, "Doctor profile not found");
    }
    res.status(200).json(doctor);
  } catch (err) {
    next(err);
  }
};

export const getDoctorAvailabilityController: RequestHandler = async (req, res, next) => {
  try {
    const doctor = await getDoctorAvailability(req.params.id);
    if (!doctor) {
      throw createHttpError(404, "Doctor not found");
    }
    res.status(200).json({
      doctor,
      availability: doctor.workingHours ?? "Schedule not provided",
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentDoctorGuardedController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const doctor = await requireDoctorForUser(user);
    res.status(200).json(doctor);
  } catch (err) {
    next(err);
  }
};

export const connectDoctorByCodeController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }

    const patient = await getPatientByUserId(user._id.toString());
    if (!patient) {
      throw createHttpError(404, "Patient profile not found");
    }

    const { doctorCode } = req.body as { doctorCode?: string };
    if (!doctorCode) {
      throw createHttpError(400, "doctorCode is required");
    }

    const doctor = await getDoctorByCode(doctorCode);
    if (!doctor) {
      throw createHttpError(404, "Doctor not found for provided code");
    }

    const updated = await assignDoctorToPatient(patient._id.toString(), doctor._id.toString());

    res.status(200).json({
      patient: updated,
      doctor,
    });
  } catch (err) {
    next(err);
  }
};
