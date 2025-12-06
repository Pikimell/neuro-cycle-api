import { createCrudControllers } from "./crudControllerFactory.js";
import service from "../services/userService.js";
import { RequestHandler } from "express";
import createHttpError from "http-errors";

const controllers = createCrudControllers(service);

export const createUserController = controllers.create;
export const getAllUsersController = controllers.getAll;
export const getUserByIdController = controllers.getById;
export const updateUserByIdController = controllers.updateById;
export const deleteUserByIdController = controllers.deleteById;

export const getCurrentUserController: RequestHandler = (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, "Unauthorized");
    }
    res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
};
