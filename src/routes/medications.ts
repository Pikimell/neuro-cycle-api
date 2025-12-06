import { Router } from "express";
import {
  createMedicationController,
  getAllMedicationsController,
  getMedicationByIdController,
  updateMedicationByIdController,
  deleteMedicationByIdController,
  getMyMedicationsController,
} from "../controllers/medicationsController.js";

const router = Router();

router.get("/my", getMyMedicationsController);
router.post("/", createMedicationController);
router.get("/", getAllMedicationsController);
router.get("/:id", getMedicationByIdController);
router.patch("/:id", updateMedicationByIdController);
router.delete("/:id", deleteMedicationByIdController);

export default router;
