import { Router } from "express";
import {
  createQuestionnaireQuestionController,
  getAllQuestionnaireQuestionsController,
  getQuestionnaireQuestionByIdController,
  updateQuestionnaireQuestionByIdController,
  deleteQuestionnaireQuestionByIdController,
} from "../controllers/questionnaireQuestionsController.js";

const router = Router();

router.post("/", createQuestionnaireQuestionController);
router.get("/", getAllQuestionnaireQuestionsController);
router.get("/:id", getQuestionnaireQuestionByIdController);
router.patch("/:id", updateQuestionnaireQuestionByIdController);
router.delete("/:id", deleteQuestionnaireQuestionByIdController);

export default router;
