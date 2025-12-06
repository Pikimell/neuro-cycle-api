import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const medicationReminderSchema = new Schema(
  {
    // Пацієнт, якому належить нагадування
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Пов'язаний запис про препарат
    medicationId: { type: Types.ObjectId, ref: "medications", required: true },
    // Час доби у форматі рядка (наприклад, 08:00)
    timeOfDay: { type: String, required: true, trim: true },
    // Індекси днів тижня для повторення
    daysOfWeek: { type: [Number], default: [] },
    // Дата початку дії нагадувань
    startDate: { type: Date, required: true },
    // Необов'язкова дата завершення графіка
    endDate: { type: Date },
    // Часовий пояс для обрахунку сповіщень
    timezone: { type: String, trim: true },
    // Прапорець активності нагадувань
    isActive: { type: Boolean, default: true },
    // Остання відмітка про прийом дози
    lastTakenAt: { type: Date },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type MedicationReminder = InferSchemaType<typeof medicationReminderSchema>;
export type MedicationReminderDocument = HydratedDocument<MedicationReminder>;
export const MedicationReminderCollection = model<MedicationReminder>(
  "medication_reminders",
  medicationReminderSchema
);
