import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

const questionnaireTemplateSchema = new Schema(
  {
    // Системний код (наприклад, PHQ9, GAD7)
    code: { type: String, required: true, unique: true, trim: true },
    // Заголовок опитувальника для відображення
    title: { type: String, required: true, trim: true },
    // Короткий опис для контексту
    description: { type: String, trim: true },
    // Частота проходження опитувальника
    periodicity: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "ON_DEMAND"],
      required: true,
    },
    // Цільовий стан або діагноз
    targetCondition: { type: String, trim: true },
    // Чи активний цей шаблон в застосунку
    isActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type QuestionnaireTemplate = InferSchemaType<typeof questionnaireTemplateSchema>;
export type QuestionnaireTemplateDocument = HydratedDocument<QuestionnaireTemplate>;
export const QuestionnaireTemplateCollection = model<QuestionnaireTemplate>(
  "questionnaire_templates",
  questionnaireTemplateSchema
);
