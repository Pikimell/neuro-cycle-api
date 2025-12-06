import { Router } from "express";
import {
  createMigraineAttackController,
  getAllMigraineAttacksController,
  getMigraineAttackByIdController,
  updateMigraineAttackByIdController,
  deleteMigraineAttackByIdController,
  completeMigraineAttackController,
  migraineCalendarController,
} from "../controllers/migraineAttacksController.js";

const router = Router();

router.post("/:id/complete", completeMigraineAttackController);
router.get("/calendar", migraineCalendarController);
router.post("/", createMigraineAttackController);
router.get("/", getAllMigraineAttacksController);
router.get("/:id", getMigraineAttackByIdController);
router.patch("/:id", updateMigraineAttackByIdController);
router.delete("/:id", deleteMigraineAttackByIdController);

export default router;
