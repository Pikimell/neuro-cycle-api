import { HydratedDocument, InferSchemaType, Schema, Types, model } from "mongoose";

const medicationScheduleSchema = new Schema(
  {
    // Пацієнт, для якого створено графік прийому
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Назва препарату
    medicationName: { type: String, required: true, trim: true },
    // Кількість дози
    doseValue: { type: Number, required: true, min: 0 },
    // Одиниця вимірювання дози (мг, мл тощо)
    doseUnit: { type: String, required: true, trim: true },
    // Початкова дата прийому
    startDate: { type: Date, required: true },
    // Кінцева дата прийому (необов'язково)
    endDate: { type: Date },
    // Дні тижня для прийому (0-6), порожній список означає щодня
    daysOfWeek: {
      type: [Number],
      default: [],
      validate: {
        validator: (values: number[]) => values.every((day) => day >= 0 && day <= 6),
        message: "daysOfWeek must contain values between 0 and 6",
      },
    },
    // Час(и) доби для нагадувань у форматі HH:mm
    timesOfDay: {
      type: [String],
      required: true,
      validate: {
        validator: (values: string[]) => Array.isArray(values) && values.length > 0,
        message: "At least one timeOfDay is required",
      },
    },
    // Додаткові рекомендації від лікаря/пацієнта
    recommendations: { type: String, trim: true },
    // Прапорець, що запис створений лікарем
    createdByDoctor: { type: Boolean, default: false },
    // Часовий пояс, за яким розраховуються часи нагадувань
    timezone: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

medicationScheduleSchema.index({ patientId: 1, startDate: -1 });

export type MedicationSchedule = InferSchemaType<typeof medicationScheduleSchema>;
export type MedicationScheduleDocument = HydratedDocument<MedicationSchedule>;
export const MedicationScheduleCollection = model<MedicationSchedule>(
  "medication_schedules",
  medicationScheduleSchema
);
