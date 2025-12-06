import { Router } from "express";
import {
  createChronicConditionController,
  getAllChronicConditionsController,
  getChronicConditionByIdController,
  updateChronicConditionByIdController,
  deleteChronicConditionByIdController,
} from "../controllers/chronicConditionsController.js";

const router = Router();

router.post("/", createChronicConditionController);
router.get("/", getAllChronicConditionsController);
router.get("/:id", getChronicConditionByIdController);
router.patch("/:id", updateChronicConditionByIdController);
router.delete("/:id", deleteChronicConditionByIdController);

export default router;
