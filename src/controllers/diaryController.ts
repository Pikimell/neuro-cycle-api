import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { requirePatientForUser } from "../helpers/patientContext.js";
import { getDaySnapshot } from "../services/diaryService.js";

export const getDiaryDayController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const date = req.query.date ? new Date(String(req.query.date)) : undefined;
    const snapshot = await getDaySnapshot(patient._id.toString(), date);
    res.status(200).json(snapshot);
  } catch (err) {
    next(err);
  }
};
