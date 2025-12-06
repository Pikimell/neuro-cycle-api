import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const appointmentSchema = new Schema(
  {
    // Пацієнт, який записується/приходить на прийом
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Лікар, задіяний у прийомі
    doctorId: { type: Types.ObjectId, ref: "doctors", required: true },
    // Хто ініціював запит
    requestedBy: { type: String, enum: ["PATIENT", "DOCTOR"], required: true },
    // Поточний статус запису
    status: {
      type: String,
      enum: ["REQUESTED", "CONFIRMED", "DECLINED", "CANCELLED", "COMPLETED"],
      default: "REQUESTED",
    },
    // Коли створили запит
    requestedAt: { type: Date, required: true },
    // Запланований початок консультації
    scheduledStart: { type: Date },
    // Запланований кінець консультації
    scheduledEnd: { type: Date },
    // Формат консультації
    locationType: { type: String, enum: ["ONLINE", "OFFLINE", "PHONE"], required: true },
    // Коментар пацієнта при записі
    patientComment: { type: String, trim: true },
    // Нотатки лікаря щодо прийому
    doctorComment: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type Appointment = InferSchemaType<typeof appointmentSchema>;
export type AppointmentDocument = HydratedDocument<Appointment>;
export const AppointmentCollection = model<Appointment>("appointments", appointmentSchema);
