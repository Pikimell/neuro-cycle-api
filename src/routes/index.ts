import { Router } from "express";
import authRouter from "./auth.js";
import { authenticate } from "../middlewares/authenticate.js";
import allergiesRouter from "./allergies.js";
import appointmentsRouter from "./appointments.js";
import chronicConditionsRouter from "./chronicConditions.js";
import doctorsRouter from "./doctors.js";
import medicationRemindersRouter from "./medicationReminders.js";
import medicationsRouter from "./medications.js";
import migraineAttacksRouter from "./migraineAttacks.js";
import moodEntriesRouter from "./moodEntries.js";
import patientsRouter from "./patients.js";
import questionnaireQuestionsRouter from "./questionnaireQuestions.js";
import questionnaireResponsesRouter from "./questionnaireResponses.js";
import questionnaireTemplatesRouter from "./questionnaireTemplates.js";
import specialConsiderationsRouter from "./specialConsiderations.js";
import usersRouter from "./users.js";
import recommendationsRouter from "./recommendations.js";
import diaryRouter from "./diary.js";


const router = Router();

router.use("/auth", authRouter);
router.use(authenticate);
router.use("/users", usersRouter);
router.use("/patients", patientsRouter);
router.use("/doctors", doctorsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/allergies", allergiesRouter);
router.use("/chronic-conditions", chronicConditionsRouter);
router.use("/special-considerations", specialConsiderationsRouter);
router.use("/medications", medicationsRouter);
router.use("/medication-reminders", medicationRemindersRouter);
router.use("/mood-entries", moodEntriesRouter);
router.use("/migraine-attacks", migraineAttacksRouter);
router.use("/questionnaire-templates", questionnaireTemplatesRouter);
router.use("/questionnaire-questions", questionnaireQuestionsRouter);
router.use("/questionnaire-responses", questionnaireResponsesRouter);
router.use("/recommendations", recommendationsRouter);
router.use("/diary", diaryRouter);


export default router;
