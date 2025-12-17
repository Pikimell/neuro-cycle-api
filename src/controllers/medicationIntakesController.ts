import { Request, RequestHandler } from "express";
import createHttpError from "http-errors";
import {
  createMedicationIntake,
  deleteMedicationIntakeById,
  getAllMedicationIntakes,
  getMedicationIntakeById,
  getMedicationIntakesForPatient,
  getMedicationIntakesForSchedule,
  updateMedicationIntakeById,
} from "../services/medicationIntakesService.js";
import {
  getMedicationScheduleById,
} from "../services/medicationSchedulesService.js";
import { MedicationIntake } from "../database/models/medicationIntakes.js";
import { requirePatientForUser } from "../helpers/patientContext.js";

const parseDateInput = (value: unknown, fieldName: string) => {
  const parsed = new Date(value as string | number | Date);
  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }
  return parsed;
};

const requireAuthUser = (req: Request) => {
  const user = req.user;
  if (!user) {
    throw createHttpError(401, "Unauthorized");
  }
  return user;
};

const getCurrentPatient = async (req: Request) => {
  const user = requireAuthUser(req);
  return requirePatientForUser(user);
};

const getCurrentPatientId = async (req: Request) => {
  const patient = await getCurrentPatient(req);
  return patient._id.toString();
};

const ensureScheduleForPatient = async (scheduleId: string, patientId: string) => {
  const schedule = await getMedicationScheduleById(scheduleId, patientId);
  if (!schedule) {
    throw createHttpError(404, "Medication schedule not found for this patient");
  }
  return schedule;
};

export const getMedicationIntakesListController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    if (user.role === "PATIENT") {
      const patientId = await getCurrentPatientId(req);
      const from = req.query.from ? parseDateInput(req.query.from, "from") : undefined;
      const to = req.query.to ? parseDateInput(req.query.to, "to") : undefined;
      const intakes = await getMedicationIntakesForPatient(patientId, from, to);
      res.status(200).json(intakes);
      return;
    }

    const patientIdQuery = req.query.patientId?.toString();
    if (patientIdQuery) {
      const from = req.query.from ? parseDateInput(req.query.from, "from") : undefined;
      const to = req.query.to ? parseDateInput(req.query.to, "to") : undefined;
      const intakes = await getMedicationIntakesForPatient(patientIdQuery, from, to);
      res.status(200).json(intakes);
      return;
    }

    const scheduleIdQuery = req.query.scheduleId?.toString();
    if (scheduleIdQuery) {
      const intakes = await getMedicationIntakesForSchedule(scheduleIdQuery);
      res.status(200).json(intakes);
      return;
    }

    const intakes = await getAllMedicationIntakes();
    res.status(200).json(intakes);
  } catch (err) {
    next(err);
  }
};

export const getMedicationIntakeByIdController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    const patientId = user.role === "PATIENT" ? await getCurrentPatientId(req) : undefined;
    const intake = await getMedicationIntakeById(req.params.id, patientId);
    if (!intake) {
      throw createHttpError(404, "Medication intake not found");
    }
    res.status(200).json(intake);
  } catch (err) {
    next(err);
  }
};

export const createMedicationIntakeForPatientController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const patient = await getCurrentPatient(req);
    const scheduleId = req.body?.scheduleId;
    if (!scheduleId) {
      throw createHttpError(400, "scheduleId is required");
    }

    const schedule = await ensureScheduleForPatient(scheduleId, patient._id.toString());
    const takenAt =
      req.body?.takenAt !== undefined ? parseDateInput(req.body.takenAt, "takenAt") : new Date();

    const intake = await createMedicationIntake({
      patientId: patient._id as MedicationIntake["patientId"],
      scheduleId: schedule._id as MedicationIntake["scheduleId"],
      takenAt,
    });
    res.status(201).json(intake);
  } catch (err) {
    next(err);
  }
};

export const createMedicationIntakeController: RequestHandler = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const scheduleId = req.body?.scheduleId;
    if (!scheduleId) {
      throw createHttpError(400, "scheduleId is required");
    }

    const schedule = await getMedicationScheduleById(scheduleId);
    if (!schedule) {
      throw createHttpError(404, "Medication schedule not found");
    }

    // Забороняємо записувати прийом не для пацієнта з графіка
    const patientId = schedule.patientId as MedicationIntake["patientId"];
    const takenAt =
      req.body?.takenAt !== undefined ? parseDateInput(req.body.takenAt, "takenAt") : new Date();

    const intake = await createMedicationIntake({
      patientId,
      scheduleId: schedule._id as MedicationIntake["scheduleId"],
      takenAt,
      // Для лікарів можна додатково валідувати прив'язку до їх пацієнтів за потреби
    });

    res.status(201).json(intake);
  } catch (err) {
    next(err);
  }
};

export const updateMedicationIntakeByIdController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    const patientId = user.role === "PATIENT" ? await getCurrentPatientId(req) : undefined;
    const payload: Record<string, unknown> = {};

    if (req.body?.takenAt !== undefined) {
      payload.takenAt = parseDateInput(req.body.takenAt, "takenAt");
    }

    if (req.body?.scheduleId !== undefined) {
      const scheduleId = String(req.body.scheduleId);
      if (patientId) {
        const schedule = await ensureScheduleForPatient(scheduleId, patientId);
        payload.scheduleId = schedule._id;
      } else {
        const schedule = await getMedicationScheduleById(scheduleId);
        if (!schedule) {
          throw createHttpError(404, "Medication schedule not found");
        }
        payload.scheduleId = schedule._id;
        payload.patientId = schedule.patientId;
      }
    }

    const intake = await updateMedicationIntakeById(req.params.id, payload, patientId);
    if (!intake) {
      throw createHttpError(404, "Medication intake not found");
    }

    res.status(200).json(intake);
  } catch (err) {
    next(err);
  }
};

export const deleteMedicationIntakeByIdController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    const patientId = user.role === "PATIENT" ? await getCurrentPatientId(req) : undefined;
    const intake = await deleteMedicationIntakeById(req.params.id, patientId);
    if (!intake) {
      throw createHttpError(404, "Medication intake not found");
    }

    res.status(200).json({ message: "Medication intake deleted" });
  } catch (err) {
    next(err);
  }
};
