import { Router } from "express";
import {
  createMedicationReminderController,
  getAllMedicationRemindersController,
  getMedicationReminderByIdController,
  updateMedicationReminderByIdController,
  deleteMedicationReminderByIdController,
  markMedicationReminderTakenController,
  markMedicationReminderMissedController,
} from "../controllers/medicationRemindersController.js";

const router = Router();

router.post("/:id/mark-taken", markMedicationReminderTakenController);
router.post("/:id/mark-missed", markMedicationReminderMissedController);
router.post("/", createMedicationReminderController);
router.get("/", getAllMedicationRemindersController);
router.get("/:id", getMedicationReminderByIdController);
router.patch("/:id", updateMedicationReminderByIdController);
router.delete("/:id", deleteMedicationReminderByIdController);

export default router;
