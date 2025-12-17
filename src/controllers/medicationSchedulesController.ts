import { Request, RequestHandler } from "express";
import createHttpError from "http-errors";
import {
  createMedicationSchedule,
  deleteMedicationScheduleById,
  getAllMedicationSchedules,
  getMedicationScheduleById,
  getMedicationSchedulesForPatient,
  updateMedicationScheduleById,
} from "../services/medicationSchedulesService.js";
import { MedicationSchedule } from "../database/models/medicationSchedules.js";
import { requirePatientForUser } from "../helpers/patientContext.js";

const parseDateInput = (value: unknown, fieldName: string) => {
  const parsed = new Date(value as string | number | Date);
  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }
  return parsed;
};

const parseNumberInput = (value: unknown, fieldName: string) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw createHttpError(400, `${fieldName} must be a number`);
  }
  return parsed;
};

const normalizeDaysOfWeek = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((day) => Number(day)).filter((day) => !Number.isNaN(day));
};

const normalizeTimesOfDay = (value: unknown, isRequired: boolean) => {
  if (!value && !isRequired) {
    return undefined;
  }

  if (!Array.isArray(value) || value.length === 0) {
    throw createHttpError(400, "timesOfDay is required and must contain at least one value");
  }

  return value.map((time) => String(time));
};

const buildSchedulePayload = (
  patientId: MedicationSchedule["patientId"],
  body: Request["body"],
  createdByDoctor: boolean,
  fallbackTimezone?: string
) => {
  const {
    medicationName,
    doseValue,
    doseUnit,
    startDate,
    endDate,
    daysOfWeek,
    timesOfDay,
    recommendations,
    timezone,
  } = body;
  const resolvedTimezone = timezone ?? fallbackTimezone;

  if (!medicationName) {
    throw createHttpError(400, "medicationName is required");
  }
  if (doseValue === undefined) {
    throw createHttpError(400, "doseValue is required");
  }
  if (!doseUnit) {
    throw createHttpError(400, "doseUnit is required");
  }
  if (!startDate) {
    throw createHttpError(400, "startDate is required");
  }

  return {
    patientId,
    medicationName: String(medicationName).trim(),
    doseValue: parseNumberInput(doseValue, "doseValue"),
    doseUnit: String(doseUnit).trim(),
    startDate: parseDateInput(startDate, "startDate"),
    endDate: endDate ? parseDateInput(endDate, "endDate") : undefined,
    daysOfWeek: normalizeDaysOfWeek(daysOfWeek),
    timesOfDay: normalizeTimesOfDay(timesOfDay, true),
    recommendations: recommendations ? String(recommendations) : undefined,
    createdByDoctor,
    timezone: resolvedTimezone ? String(resolvedTimezone) : undefined,
  } as Partial<MedicationSchedule>;
};

const buildScheduleUpdatePayload = (
  body: Request["body"],
  fallbackTimezone?: string
) => {
  const {
    medicationName,
    doseValue,
    doseUnit,
    startDate,
    endDate,
    daysOfWeek,
    timesOfDay,
    recommendations,
    timezone,
  } = body;

  const payload: Partial<MedicationSchedule> = {};

  if (medicationName !== undefined) payload.medicationName = String(medicationName).trim();
  if (doseValue !== undefined) payload.doseValue = parseNumberInput(doseValue, "doseValue");
  if (doseUnit !== undefined) payload.doseUnit = String(doseUnit).trim();
  if (startDate !== undefined) payload.startDate = parseDateInput(startDate, "startDate");
  if (endDate !== undefined) {
    payload.endDate = endDate ? parseDateInput(endDate, "endDate") : undefined;
  }
  if (daysOfWeek !== undefined) payload.daysOfWeek = normalizeDaysOfWeek(daysOfWeek);
  if (timesOfDay !== undefined) payload.timesOfDay = normalizeTimesOfDay(timesOfDay, true);
  if (recommendations !== undefined) {
    payload.recommendations = recommendations ? String(recommendations) : undefined;
  }
  if (timezone !== undefined) {
    const resolvedTimezone = timezone ?? fallbackTimezone;
    payload.timezone = resolvedTimezone ? String(resolvedTimezone) : undefined;
  }

  return payload;
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

export const getMedicationSchedulesListController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    if (user.role === "PATIENT") {
      const patientId = await getCurrentPatientId(req);
      const schedules = await getMedicationSchedulesForPatient(patientId);
      res.status(200).json(schedules);
      return;
    }

    const patientIdQuery = req.query.patientId?.toString();
    const schedules = patientIdQuery
      ? await getMedicationSchedulesForPatient(patientIdQuery)
      : await getAllMedicationSchedules();
    res.status(200).json(schedules);
  } catch (err) {
    next(err);
  }
};

export const getMedicationScheduleByIdController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    const patientId = user.role === "PATIENT" ? await getCurrentPatientId(req) : undefined;
    const schedule = await getMedicationScheduleById(req.params.id, patientId);
    if (!schedule) {
      throw createHttpError(404, "Medication schedule not found");
    }
    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
};

export const createMedicationScheduleForPatientController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const patient = await getCurrentPatient(req);
    const createdByDoctor = req.user?.role === "DOCTOR";
    const payload = buildSchedulePayload(
      patient._id as MedicationSchedule["patientId"],
      req.body,
      createdByDoctor,
      patient.timezone ?? undefined
    );
    const schedule = await createMedicationSchedule(payload);
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
};

export const createMedicationScheduleController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    const { patientId } = req.body;
    if (!patientId) {
      throw createHttpError(400, "patientId is required");
    }

    const payload = buildSchedulePayload(
      patientId,
      req.body,
      user.role === "DOCTOR",
      undefined
    );
    const schedule = await createMedicationSchedule(payload);
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
};

export const updateMedicationScheduleByIdController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    const patientId = user.role === "PATIENT" ? await getCurrentPatientId(req) : undefined;
    const patientTimezone =
      user.role === "PATIENT" ? (await getCurrentPatient(req)).timezone ?? undefined : undefined;

    const payload = buildScheduleUpdatePayload(req.body, patientTimezone);
    const schedule = await updateMedicationScheduleById(req.params.id, payload, patientId);
    if (!schedule) {
      throw createHttpError(404, "Medication schedule not found");
    }

    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
};

export const deleteMedicationScheduleByIdController: RequestHandler = async (req, res, next) => {
  try {
    const user = requireAuthUser(req);
    const patientId = user.role === "PATIENT" ? await getCurrentPatientId(req) : undefined;
    const schedule = await deleteMedicationScheduleById(req.params.id, patientId);
    if (!schedule) {
      throw createHttpError(404, "Medication schedule not found");
    }

    res.status(200).json({ message: "Medication schedule deleted" });
  } catch (err) {
    next(err);
  }
};
