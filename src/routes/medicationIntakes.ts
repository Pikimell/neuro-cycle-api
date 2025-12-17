import { Router } from "express";
import {
  createMedicationIntakeController,
  createMedicationIntakeForPatientController,
  deleteMedicationIntakeByIdController,
  getMedicationIntakeByIdController,
  getMedicationIntakesListController,
  updateMedicationIntakeByIdController,
} from "../controllers/medicationIntakesController.js";

const router = Router();

router.get("/my", getMedicationIntakesListController);
router.post("/my", createMedicationIntakeForPatientController);
router.get("/", getMedicationIntakesListController);
router.post("/", createMedicationIntakeController);
router.get("/:id", getMedicationIntakeByIdController);
router.patch("/:id", updateMedicationIntakeByIdController);
router.delete("/:id", deleteMedicationIntakeByIdController);

export default router;
