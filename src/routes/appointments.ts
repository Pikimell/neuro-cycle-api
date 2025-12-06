import { Router } from "express";
import {
  createAppointmentController,
  getAllAppointmentsController,
  getAppointmentByIdController,
  updateAppointmentByIdController,
  deleteAppointmentByIdController,
  respondToAppointmentController,
  getMyAppointmentsController,
} from "../controllers/appointmentsController.js";

const router = Router();

router.get("/my", getMyAppointmentsController);
router.post("/:id/respond", respondToAppointmentController);
router.post("/", createAppointmentController);
router.get("/", getAllAppointmentsController);
router.get("/:id", getAppointmentByIdController);
router.patch("/:id", updateAppointmentByIdController);
router.delete("/:id", deleteAppointmentByIdController);

export default router;
