import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { createCrudControllers } from "./crudControllerFactory.js";
import service, { completeMigraineAttack, getMigraineCalendar } from "../services/migraineAttacksService.js";
import { requirePatientForUser } from "../helpers/patientContext.js";

const controllers = createCrudControllers(service);

export const createMigraineAttackController = controllers.create;
export const getAllMigraineAttacksController = controllers.getAll;
export const getMigraineAttackByIdController = controllers.getById;
export const updateMigraineAttackByIdController = controllers.updateById;
export const deleteMigraineAttackByIdController = controllers.deleteById;

export const completeMigraineAttackController: RequestHandler = async (req, res, next) => {
  try {
    const result = await completeMigraineAttack(req.params.id, req.body);
    if (!result) {
      throw createHttpError(404, "Migraine attack not found");
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const migraineCalendarController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(401, "Unauthorized");
    }
    const patient = await requirePatientForUser(user);
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();
    const items = await getMigraineCalendar(patient._id.toString(), month, year);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};
