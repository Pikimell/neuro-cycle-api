import { Router } from "express";
import {
  createPatientController,
  getAllPatientsController,
  getPatientByIdController,
  updatePatientByIdController,
  deletePatientByIdController,
  getCurrentPatientController,
  getPatientSummaryController,
  getMyPatientSummaryController,
} from "../controllers/patientsController.js";

const router = Router();

router.get("/me", getCurrentPatientController);
router.get("/me/summary", getMyPatientSummaryController);
router.get("/:id/summary", getPatientSummaryController);
router.post("/", createPatientController);
router.get("/", getAllPatientsController);
router.get("/:id", getPatientByIdController);
router.patch("/:id", updatePatientByIdController);
router.delete("/:id", deletePatientByIdController);

export default router;
