import { Router } from "express";
import {
  createMedicationController,
  getAllMedicationsController,
  getMedicationByIdController,
  updateMedicationByIdController,
  deleteMedicationByIdController,
} from "../controllers/medicationsController.js";

const router = Router();

router.post("/", createMedicationController);
router.get("/", getAllMedicationsController);
router.get("/:id", getMedicationByIdController);
router.patch("/:id", updateMedicationByIdController);
router.delete("/:id", deleteMedicationByIdController);

export default router;
