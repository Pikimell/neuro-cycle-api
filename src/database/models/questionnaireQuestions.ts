import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const questionnaireQuestionSchema = new Schema(
  {
    // Пов'язаний шаблон опитувальника
    questionnaireId: { type: Types.ObjectId, ref: "questionnaire_templates", required: true },
    // Порядковий номер питання в опитувальнику
    order: { type: Number, required: true },
    // Текст питання, що показується користувачу
    text: { type: String, required: true, trim: true },
    // Тип відповіді (лікертові шкали, дескриптори тощо)
    answerType: {
      type: String,
      enum: ["LIKERT_0_3", "LIKERT_0_4", "DESCRIPTOR_LIST", "VAS_0_10"],
      required: true,
    },
    // Варіанти для вибіркових відповідей
    options: { type: [String], default: [] },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type QuestionnaireQuestion = InferSchemaType<typeof questionnaireQuestionSchema>;
export type QuestionnaireQuestionDocument = HydratedDocument<QuestionnaireQuestion>;
export const QuestionnaireQuestionCollection = model<QuestionnaireQuestion>(
  "questionnaire_questions",
  questionnaireQuestionSchema
);
