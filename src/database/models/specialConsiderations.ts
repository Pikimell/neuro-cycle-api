import { HydratedDocument, InferSchemaType, Schema, model, Types } from "mongoose";

const specialConsiderationsSchema = new Schema(
  {
    // Пацієнт, якому належать особливі застереження
    patientId: { type: Types.ObjectId, ref: "patients", required: true },
    // Коди релігійних або етичних обмежень
    religiousRestrictions: { type: [String], default: [] },
    // Текстовий опис релігійних/етичних обмежень
    religiousNote: { type: String, trim: true },
    // Список дієтичних обмежень
    dietRestrictions: { type: [String], default: [] },
    // Інші важливі застереження
    otherRestrictions: { type: String, trim: true },
    // Статус вагітності/годування
    pregnancyStatus: {
      type: String,
      enum: ["NONE", "PREGNANT", "LACTATION", "PLANNING", "UNKNOWN"],
      default: "UNKNOWN",
    },
    // Згода використовувати блок у рекомендаціях
    consentUseForRecommendations: { type: Boolean, default: false },
    // Чи може лікар бачити повний блок
    visibleToDoctor: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type SpecialConsiderations = InferSchemaType<typeof specialConsiderationsSchema>;
export type SpecialConsiderationsDocument = HydratedDocument<SpecialConsiderations>;
export const SpecialConsiderationsCollection = model<SpecialConsiderations>(
  "special_considerations",
  specialConsiderationsSchema
);
