import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    // Cognito subject для зв'язку з AWS користувачем
    cognitoSub: {
      type: String,
      required: true,
      unique: true,
    },
    // Email для входу, використовується як логін
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Хеш пароля для локальної автентифікації
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    // Роль користувача в застосунку
    role: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "ADMIN"],
      default: "PATIENT",
    },
    // Прапорець активності акаунта
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

userSchema.methods.toJSON = function (this: UserDocument) {
  const { passwordHash, ...rest } = this.toObject();
  return rest;
};

export const UserCollection = model<User>("users", userSchema);
