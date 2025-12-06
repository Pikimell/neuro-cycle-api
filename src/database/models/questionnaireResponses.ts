import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const questionnaireResponseSchema = new Schema(
  {
    // Пацієнт, який заповнив опитувальник
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Посилання на шаблон опитувальника
    questionnaireId: { type: Types.ObjectId, ref: "questionnaire_templates", required: true },
    // Лікар, який призначив опитувальник (опційно)
    doctorId: { type: Types.ObjectId, ref: "doctors" },
    // Час початку заповнення
    startedAt: { type: Date, required: true },
    // Час завершення заповнення
    completedAt: { type: Date },
    // Масив відповідей (питання -> обране значення)
    answers: { type: Schema.Types.Mixed, default: [] },
    // Розрахований загальний бал (наприклад, сума PHQ-9)
    totalScore: { type: Number },
    // Інтерпретація балу (легка, помірна тощо)
    severityLevel: { type: String, trim: true },
    // Чи були виявлені red flags
    redFlagsDetected: { type: Boolean, default: false },
    // Список спрацьованих red flags
    redFlags: { type: [String], default: [] },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type QuestionnaireResponse = InferSchemaType<typeof questionnaireResponseSchema>;
export type QuestionnaireResponseDocument = HydratedDocument<QuestionnaireResponse>;
export const QuestionnaireResponseCollection = model<QuestionnaireResponse>(
  "questionnaire_responses",
  questionnaireResponseSchema
);
