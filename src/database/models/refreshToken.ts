import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export type RefreshToken = InferSchemaType<typeof refreshTokenSchema>;
export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

export const RefreshTokenCollection = model<RefreshToken>(
  "refresh_tokens",
  refreshTokenSchema
);
