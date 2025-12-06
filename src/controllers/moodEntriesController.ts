import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, {
  upsertDailyMoodEntry,
  getLatestMoodEntry,
  getMoodHistory,
} from "../services/moodEntriesService.js";
import { requirePatientForUser } from "../helpers/patientContext.js";

const controllers = createCrudControllers(service);

export const createMoodEntryController = controllers.create;
export const getAllMoodEntriesController = controllers.getAll;
export const getMoodEntryByIdController = controllers.getById;
export const updateMoodEntryByIdController = controllers.updateById;
export const deleteMoodEntryByIdController = controllers.deleteById;

export const createDailyMoodEntryController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const { moodScore, comment } = req.body as { moodScore: number; comment?: string };
    const moodScaleType = req.body?.moodScaleType === "EMOJI_SLIDER" ? "EMOJI_SLIDER" : undefined;

    if (typeof moodScore !== "number") {
      throw createHttpError(400, "moodScore is required");
    }

    const result = await upsertDailyMoodEntry({
      patientId: patient._id.toString(),
      moodScore,
      moodScaleType,
      comment,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCurrentMoodEntryController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const result = await getLatestMoodEntry(patient._id.toString());
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getMoodHistoryController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;

    const result = await getMoodHistory(patient._id.toString(), from, to);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
