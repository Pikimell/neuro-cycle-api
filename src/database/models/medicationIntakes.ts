import { HydratedDocument, InferSchemaType, Schema, Types, model } from "mongoose";

const medicationIntakeSchema = new Schema(
  {
    // Запис графіка, за яким відбувся прийом
    scheduleId: { type: Types.ObjectId, ref: "medication_schedules", required: true },
    // Пацієнт, що прийняв препарат
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Час фактичного прийому
    takenAt: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

medicationIntakeSchema.index({ patientId: 1, takenAt: -1 });
medicationIntakeSchema.index({ scheduleId: 1, takenAt: -1 });

export type MedicationIntake = InferSchemaType<typeof medicationIntakeSchema>;
export type MedicationIntakeDocument = HydratedDocument<MedicationIntake>;
export const MedicationIntakeCollection = model<MedicationIntake>(
  "medication_intakes",
  medicationIntakeSchema
);
