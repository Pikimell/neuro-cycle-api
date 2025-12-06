import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { requirePatientForUser } from "../helpers/patientContext.js";
import { getRecommendationsForPatient } from "../services/recommendationsService.js";

export const getRecommendationsController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const recommendations = await getRecommendationsForPatient(patient);
    res.status(200).json(recommendations);
  } catch (err) {
    next(err);
  }
};
