import { Router } from "express";
import {
  createDoctorController,
  getAllDoctorsController,
  getDoctorByIdController,
  updateDoctorByIdController,
  deleteDoctorByIdController,
  getCurrentDoctorController,
  getDoctorAvailabilityController,
  connectDoctorByCodeController,
} from "../controllers/doctorsController.js";

const router = Router();

router.post("/connect", connectDoctorByCodeController);
router.get("/me", getCurrentDoctorController);
router.get("/:id/availability", getDoctorAvailabilityController);
router.post("/", createDoctorController);
router.get("/", getAllDoctorsController);
router.get("/:id", getDoctorByIdController);
router.patch("/:id", updateDoctorByIdController);
router.delete("/:id", deleteDoctorByIdController);

export default router;
