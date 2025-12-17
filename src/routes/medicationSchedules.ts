import { Router } from "express";
import {
  createMedicationScheduleController,
  createMedicationScheduleForPatientController,
  deleteMedicationScheduleByIdController,
  getMedicationScheduleByIdController,
  getMedicationSchedulesListController,
  updateMedicationScheduleByIdController,
} from "../controllers/medicationSchedulesController.js";

const router = Router();

router.get("/my", getMedicationSchedulesListController);
router.post("/my", createMedicationScheduleForPatientController);
router.get("/", getMedicationSchedulesListController);
router.post("/", createMedicationScheduleController);
router.get("/:id", getMedicationScheduleByIdController);
router.patch("/:id", updateMedicationScheduleByIdController);
router.delete("/:id", deleteMedicationScheduleByIdController);

export default router;
