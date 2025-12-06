import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const migraineAttackSchema = new Schema(
  {
    // Пацієнт, якому належить запис нападу
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Початок нападу
    startDateTime: { type: Date, required: true },
    // Завершення нападу (може бути null, якщо ще триває)
    endDateTime: { type: Date },
    // Кешована тривалість у хвилинах
    durationMinutes: { type: Number },
    // Інтенсивність болю за шкалою VAS 0-10
    intensityVAS: { type: Number },
    // Локації головного болю
    headacheLocations: { type: [String], default: [] },
    // Опис болю в інших частинах тіла
    otherBodyPainLocation: { type: String, trim: true },
    // Ймовірні тригери
    suspectedTriggers: { type: [String], default: [] },
    // Чи була аура
    auraPresent: { type: Boolean, default: false },
    // Типи аури
    auraTypes: { type: [String], default: [] },
    // Додаткові симптоми під час нападу
    additionalSymptoms: { type: [String], default: [] },
    // Позначка, чи заповнений опитувальник McGill
    mcgillCompleted: { type: Boolean, default: false },
    // Короткий опис профілю болю за McGill
    mcgillPainProfile: { type: String, trim: true },
    // Індикатор виявлених "red flags"
    isRedFlag: { type: Boolean, default: false },
    // Які саме "red flags" спрацювали
    redFlags: { type: [String], default: [] },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type MigraineAttack = InferSchemaType<typeof migraineAttackSchema>;
export type MigraineAttackDocument = HydratedDocument<MigraineAttack>;
export const MigraineAttackCollection = model<MigraineAttack>(
  "migraine_attacks",
  migraineAttackSchema
);
