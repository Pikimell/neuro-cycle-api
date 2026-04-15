import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const passwordAccountSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    login: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type PasswordAccount = InferSchemaType<typeof passwordAccountSchema>;
export type PasswordAccountDocument = HydratedDocument<PasswordAccount>;

export const PasswordAccountCollection = model<PasswordAccount>(
  "password_accounts",
  passwordAccountSchema
);
