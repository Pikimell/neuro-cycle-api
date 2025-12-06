import { Router } from "express";
import {
  createQuestionnaireTemplateController,
  getAllQuestionnaireTemplatesController,
  getQuestionnaireTemplateByIdController,
  updateQuestionnaireTemplateByIdController,
  deleteQuestionnaireTemplateByIdController,
  getAssignedQuestionnaireTemplatesController,
} from "../controllers/questionnaireTemplatesController.js";

const router = Router();

router.get("/assigned", getAssignedQuestionnaireTemplatesController);
router.post("/", createQuestionnaireTemplateController);
router.get("/", getAllQuestionnaireTemplatesController);
router.get("/:id", getQuestionnaireTemplateByIdController);
router.patch("/:id", updateQuestionnaireTemplateByIdController);
router.delete("/:id", deleteQuestionnaireTemplateByIdController);

export default router;
