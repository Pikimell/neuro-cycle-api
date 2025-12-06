import { MoodEntryCollection } from "../database/models/moodEntries.js";
import { MigraineAttackCollection } from "../database/models/migraineAttacks.js";
import { MedicationCollection } from "../database/models/medications.js";
import { QuestionnaireResponseCollection } from "../database/models/questionnaireResponses.js";

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const getDaySnapshot = async (patientId: string, date?: Date) => {
  const { start, end } = getDayRange(date);

  const [moodEntries, migraineAttacks, medications, questionnaireResponses] = await Promise.all([
    MoodEntryCollection.find({ patientId, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
    MigraineAttackCollection.find({
      patientId,
      startDateTime: { $lte: end },
      $or: [{ endDateTime: { $gte: start } }, { endDateTime: null }],
    }).sort({ startDateTime: -1 }),
    MedicationCollection.find({
      patientId,
      isActive: true,
    }).sort({ startDate: -1 }),
    QuestionnaireResponseCollection.find({
      patientId,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }),
  ]);

  return {
    date: start,
    moodEntries,
    migraineAttacks,
    medications,
    questionnaireResponses,
  };
};
