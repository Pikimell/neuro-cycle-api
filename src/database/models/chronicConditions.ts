import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const chronicConditionSchema = new Schema(
  {
    // Пацієнт, якому належить запис про хронічний стан
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Назва стану (наприклад, хронічна мігрень)
    name: { type: String, required: true, trim: true },
    // Дата, з якої відомий діагноз
    sinceDate: { type: Date },
    // Стадія або ступінь тяжкості
    stage: { type: String, trim: true },
    // Вільні нотатки від пацієнта або лікаря
    notes: { type: String, trim: true },
    // Ім'я лікуючого лікаря (текстом)
    treatingPhysician: { type: String, trim: true },
    // Чи бачить закріплений лікар цей запис
    visibleToDoctor: { type: Boolean, default: true },
    // Чи є стан актуальним
    isActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type ChronicCondition = InferSchemaType<typeof chronicConditionSchema>;
export type ChronicConditionDocument = HydratedDocument<ChronicCondition>;
export const ChronicConditionCollection = model<ChronicCondition>(
  "chronic_conditions",
  chronicConditionSchema
);
