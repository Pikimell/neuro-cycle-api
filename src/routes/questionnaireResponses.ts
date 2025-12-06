import { Router } from "express";
import {
  createQuestionnaireResponseController,
  getAllQuestionnaireResponsesController,
  getQuestionnaireResponseByIdController,
  updateQuestionnaireResponseByIdController,
  deleteQuestionnaireResponseByIdController,
  submitQuestionnaireResponseController,
  getMyQuestionnaireResponsesController,
} from "../controllers/questionnaireResponsesController.js";

const router = Router();

router.post("/submit", submitQuestionnaireResponseController);
router.get("/my", getMyQuestionnaireResponsesController);
router.post("/", createQuestionnaireResponseController);
router.get("/", getAllQuestionnaireResponsesController);
router.get("/:id", getQuestionnaireResponseByIdController);
router.patch("/:id", updateQuestionnaireResponseByIdController);
router.delete("/:id", deleteQuestionnaireResponseByIdController);

export default router;
