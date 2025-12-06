import { Router } from "express";
import { getRecommendationsController } from "../controllers/recommendationsController.js";

const router = Router();

router.get("/", getRecommendationsController);

export default router;
