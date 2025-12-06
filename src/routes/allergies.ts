import { Router } from "express";
import {
  createAllergyController,
  getAllAllergiesController,
  getAllergyByIdController,
  updateAllergyByIdController,
  deleteAllergyByIdController,
} from "../controllers/allergiesController.js";

const router = Router();

router.post("/", createAllergyController);
router.get("/", getAllAllergiesController);
router.get("/:id", getAllergyByIdController);
router.patch("/:id", updateAllergyByIdController);
router.delete("/:id", deleteAllergyByIdController);

export default router;
