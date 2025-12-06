import { Router } from "express";
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  deleteUserByIdController,
} from "../controllers/usersController.js";

const router = Router();

router.post("/", createUserController);
router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.patch("/:id", updateUserByIdController);
router.delete("/:id", deleteUserByIdController);

export default router;
