import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const medicationSchema = new Schema(
  {
    // Пацієнт, якому належить препарат
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Назва препарату
    name: { type: String, required: true, trim: true },
    // Опис дози (наприклад, 50 мг двічі на день)
    dosageDescription: { type: String, trim: true },
    // Форма випуску (таблетки, краплі, ін'єкція)
    form: { type: String, trim: true },
    // Примітки щодо умов прийому
    notes: { type: String, trim: true },
    // Чи є препарат актуальним
    isActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type Medication = InferSchemaType<typeof medicationSchema>;
export type MedicationDocument = HydratedDocument<Medication>;
export const MedicationCollection = model<Medication>("medications", medicationSchema);
