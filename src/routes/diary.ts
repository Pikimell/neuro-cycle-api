import { Router } from "express";
import { getDiaryDayController } from "../controllers/diaryController.js";

const router = Router();

router.get("/day", getDiaryDayController);

export default router;
