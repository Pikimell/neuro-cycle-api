import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const allergySchema = new Schema(
  {
    // Пацієнт, якому належить запис про алергію
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Алерген або назва речовини
    substance: { type: String, required: true, trim: true },
    // Опис реакції
    reaction: { type: String, trim: true },
    // Рівень тяжкості реакції
    severity: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH"],
      required: true,
    },
    // Додаткові примітки
    notes: { type: String, trim: true },
    // Чи бачить це запис закріплений лікар
    visibleToDoctor: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type Allergy = InferSchemaType<typeof allergySchema>;
export type AllergyDocument = HydratedDocument<Allergy>;
export const AllergyCollection = model<Allergy>("allergies", allergySchema);
