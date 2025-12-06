import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const doctorSchema = new Schema(
  {
    // Посилання на запис користувача платформи
    userId: { type: Types.ObjectId, ref: "users", required: true },
    // Повне ім'я лікаря для відображення
    fullName: { type: String, required: true, trim: true },
    // Медична спеціалізація (невролог, психіатр тощо)
    specialization: { type: String, required: true, trim: true },
    // Назва клініки або закладу
    clinic: { type: String, trim: true },
    // Робочий контактний телефон
    phone: { type: String, trim: true },
    // Робочий email
    email: { type: String, trim: true, lowercase: true },
    // Код, за яким пацієнти підключаються до лікаря
    doctorCode: { type: String, required: true, unique: true, trim: true },
    // Короткий опис робочих годин
    workingHours: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type Doctor = InferSchemaType<typeof doctorSchema>;
export type DoctorDocument = HydratedDocument<Doctor>;
export const DoctorCollection = model<Doctor>("doctors", doctorSchema);
