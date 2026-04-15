import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const authAccountSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["google", "apple"],
      required: true,
    },
    providerUserId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
  }
);

authAccountSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

export type AuthAccount = InferSchemaType<typeof authAccountSchema>;
export type AuthAccountDocument = HydratedDocument<AuthAccount>;

export const AuthAccountCollection = model<AuthAccount>("auth_accounts", authAccountSchema);
