import { createCrudControllers } from "./crudControllerFactory.js";
import service from "../services/userService.js";

const controllers = createCrudControllers(service);

export const createUserController = controllers.create;
export const getAllUsersController = controllers.getAll;
export const getUserByIdController = controllers.getById;
export const updateUserByIdController = controllers.updateById;
export const deleteUserByIdController = controllers.deleteById;
