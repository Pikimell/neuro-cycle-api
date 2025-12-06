import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const patientSchema = new Schema(
  {
    // Посилання на запис користувача платформи
    userId: { type: Types.ObjectId, ref: "users", required: true },
    // Повне ім'я пацієнта для відображення та документів
    fullName: { type: String, required: true, trim: true },
    // Дата народження для вікової логіки
    dateOfBirth: { type: Date, required: true },
    // Стать для опитувальників та рекомендацій
    sex: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"],
      default: "UNSPECIFIED",
    },
    // Контактний телефон пацієнта
    phone: { type: String, trim: true },
    // Основна категорія діагнозу
    diagnosisType: {
      type: String,
      enum: ["NONE", "EPISODIC_MIGRAINE", "CHRONIC_MIGRAINE", "OTHER"],
      default: "NONE",
    },
    // Поточний закріплений лікар (опційно)
    assignedDoctorId: { type: Types.ObjectId, ref: "doctors" },
    // Часовий пояс для нагадувань
    timezone: { type: String, trim: true },
    // Бажана мова спілкування/інтерфейсу
    preferredLanguage: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type Patient = InferSchemaType<typeof patientSchema>;
export type PatientDocument = HydratedDocument<Patient>;
export const PatientCollection = model<Patient>("patients", patientSchema);
