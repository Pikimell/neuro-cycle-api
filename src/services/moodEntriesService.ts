import { MoodEntryCollection, type MoodEntry } from "../database/models/moodEntries.js";
import { createCrudService } from "./crudServiceFactory.js";

const service = createCrudService<MoodEntry>(MoodEntryCollection, "Mood entry");

export const createMoodEntry = service.create;
export const getAllMoodEntries = service.getAll;
export const getMoodEntryById = service.getById;
export const updateMoodEntryById = service.updateById;
export const deleteMoodEntryById = service.deleteById;

type DailyMoodPayload = {
  patientId: string;
  moodScore: number;
  moodScaleType?: MoodEntry["moodScaleType"];
  comment?: string;
  date?: Date;
};

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const upsertDailyMoodEntry = async ({
  patientId,
  moodScore,
  moodScaleType,
  comment,
  date,
}: DailyMoodPayload) => {
  const { start, end } = getDayRange(date);

  return MoodEntryCollection.findOneAndUpdate(
    { patientId, date: { $gte: start, $lte: end } },
    { patientId, date: start, moodScore, moodScaleType, comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const getLatestMoodEntry = (patientId: string) => {
  return MoodEntryCollection.findOne({ patientId }).sort({ date: -1, createdAt: -1 });
};

export const getMoodHistory = (patientId: string, from?: Date, to?: Date) => {
  const query: Record<string, unknown> = { patientId };
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.$gte = from;
    if (to) range.$lte = to;
    query.date = range;
  }
  return MoodEntryCollection.find(query).sort({ date: -1 });
};

export default service;
