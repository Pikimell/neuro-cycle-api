import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const moodEntrySchema = new Schema(
  {
    // Пацієнт, якому належить запис настрою
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Дата, до якої відноситься настрій
    date: { type: Date, required: true },
    // Значення повзунка інтенсивності настрою
    moodScore: { type: Number, required: true },
    // Використана шкала настрою
    moodScaleType: { type: String, enum: ["EMOJI_SLIDER"], default: "EMOJI_SLIDER" },
    // Додатковий коментар користувача
    comment: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type MoodEntry = InferSchemaType<typeof moodEntrySchema>;
export type MoodEntryDocument = HydratedDocument<MoodEntry>;
export const MoodEntryCollection = model<MoodEntry>("mood_entries", moodEntrySchema);
