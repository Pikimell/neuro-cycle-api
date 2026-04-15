import { UserCollection, type User, type UserDocument } from "../database/models/user.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<User>(UserCollection, "User");

export const createUser = service.create;
export const getAllUsers = service.getAll;
export const getUserById = service.getById;
export const updateUserById = service.updateById;
export const deleteUserById = service.deleteById;

export const getUserByEmail = async (email: string): Promise<UserDocument> => {
  const user = await UserCollection.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    throw new Error("User not found!");
  }

  return user;
};

export const getUserByPublicId = async (userId: string): Promise<UserDocument> => {
  const user = await UserCollection.findOne({ userId });

  if (!user) {
    throw new Error("User not found!");
  }

  return user;
};

export default service;
