import { Router } from "express";
import {
  createMoodEntryController,
  getAllMoodEntriesController,
  getMoodEntryByIdController,
  updateMoodEntryByIdController,
  deleteMoodEntryByIdController,
  createDailyMoodEntryController,
  getCurrentMoodEntryController,
  getMoodHistoryController,
} from "../controllers/moodEntriesController.js";

const router = Router();

router.post("/daily", createDailyMoodEntryController);
router.get("/current", getCurrentMoodEntryController);
router.get("/history", getMoodHistoryController);

router.post("/", createMoodEntryController);
router.get("/", getAllMoodEntriesController);
router.get("/:id", getMoodEntryByIdController);
router.patch("/:id", updateMoodEntryByIdController);
router.delete("/:id", deleteMoodEntryByIdController);

export default router;
