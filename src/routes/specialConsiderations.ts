import { Router } from "express";
import {
  createSpecialConsiderationsController,
  getAllSpecialConsiderationsController,
  getSpecialConsiderationsByIdController,
  updateSpecialConsiderationsByIdController,
  deleteSpecialConsiderationsByIdController,
} from "../controllers/specialConsiderationsController.js";

const router = Router();

router.post("/", createSpecialConsiderationsController);
router.get("/", getAllSpecialConsiderationsController);
router.get("/:id", getSpecialConsiderationsByIdController);
router.patch("/:id", updateSpecialConsiderationsByIdController);
router.delete("/:id", deleteSpecialConsiderationsByIdController);

export default router;
