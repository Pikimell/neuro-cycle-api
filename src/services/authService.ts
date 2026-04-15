import bcrypt from "bcryptjs";
import crypto from "crypto";
import createHttpError from "http-errors";

import { PasswordAccountCollection } from "../database/models/passwordAccount.js";
import { RefreshTokenCollection, type RefreshTokenDocument } from "../database/models/refreshToken.js";
import { UserCollection, type UserDocument } from "../database/models/user.js";
import { createPatient } from "./patientsService.js";
import { Patient } from "../database/models/patients.js";
import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  signAccessToken,
} from "../helpers/appTokens.js";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type RegisterPayload = {
  login: string;
  password: string;
  email?: string | null;
  name?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | Date | null;
  sex?: Patient["sex"];
  phone?: string;
  diagnosisType?: Patient["diagnosisType"];
  timezone?: string;
  preferredLanguage?: string;
};

type LoginPayload = {
  login: string;
  password: string;
};

type ResetPasswordPayload = {
  loginOrEmail: string;
  code: string;
  newPassword: string;
};

const BCRYPT_ROUNDS = 12;

const normalizeLogin = (login: string) => login.trim().toLowerCase();
const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? null;
const normalizeName = (name?: string | null) => name?.trim() || null;

const issueRefreshToken = async (userId: string) => {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  await RefreshTokenCollection.create({
    userId,
    tokenHash,
    expiresAt: getRefreshTokenExpiry(),
    revokedAt: null,
  });

  return refreshToken;
};

const issueAuthSession = async (userId: string): Promise<AuthSession> => {
  const { accessToken, expiresIn } = signAccessToken(userId);
  const refreshToken = await issueRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

const parseOptionalBirthDate = (value?: string | Date | null) => {
  if (value === undefined || value === null) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError(400, "Invalid dateOfBirth");
  }

  return parsed;
};

const createUserRecord = async (params: { email?: string | null; name?: string | null }) => {
  const user = await UserCollection.create({
    userId: crypto.randomUUID(),
    email: normalizeEmail(params.email),
    name: normalizeName(params.name),
    revisionCounter: 0,
    role: "PATIENT",
  });

  return user;
};

const ensurePlatformUserId = async (user: UserDocument) => {
  const currentUserId = typeof user.userId === "string" ? user.userId.trim() : "";
  if (currentUserId) {
    return currentUserId;
  }

  user.userId = crypto.randomUUID();
  user.revisionCounter += 1;
  await user.save();
  return user.userId;
};

const maybeCreatePatientProfile = async (
  user: UserDocument,
  params: Pick<
    RegisterPayload,
    "fullName" | "dateOfBirth" | "sex" | "phone" | "diagnosisType" | "timezone" | "preferredLanguage"
  >
) => {
  const fullName = normalizeName(params.fullName);
  const dateOfBirth = parseOptionalBirthDate(params.dateOfBirth);

  if (!fullName || !dateOfBirth) {
    return null;
  }

  const existingPatient = await createPatient({
    userId: user._id as Patient["userId"],
    fullName,
    dateOfBirth,
    sex: params.sex ?? undefined,
    phone: params.phone,
    diagnosisType: params.diagnosisType ?? undefined,
    timezone: params.timezone,
    preferredLanguage: params.preferredLanguage,
  });

  return existingPatient;
};

const findRefreshTokenRecord = async (refreshToken: string) => {
  const tokenHash = hashRefreshToken(refreshToken);
  return RefreshTokenCollection.findOne({ tokenHash });
};

const ensureValidRefreshToken = (tokenRecord: RefreshTokenDocument | null) => {
  if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt.getTime() <= Date.now()) {
    throw createHttpError(401, "Invalid refresh token");
  }

  return tokenRecord;
};

export const registerUserService = async (payload: RegisterPayload) => {
  const login = normalizeLogin(payload.login);
  const email = normalizeEmail(payload.email);

  if (!login) {
    throw createHttpError(400, "login is required");
  }

  if (!payload.password || payload.password.length < 8) {
    throw createHttpError(400, "Password must be at least 8 characters");
  }

  const existingLogin = await PasswordAccountCollection.findOne({ login });
  if (existingLogin) {
    throw createHttpError(409, "Login already exists");
  }

  let user = email ? await UserCollection.findOne({ email }) : null;
  let createdUser = false;

  if (!user) {
    user = await createUserRecord({
      email,
      name: payload.name ?? payload.fullName ?? null,
    });
    createdUser = true;
  }

  try {
    const platformUserId = await ensurePlatformUserId(user);

    await PasswordAccountCollection.create({
      userId: platformUserId,
      login,
      passwordHash: await bcrypt.hash(payload.password, BCRYPT_ROUNDS),
    });

    if (createdUser) {
      await maybeCreatePatientProfile(user, payload);
    }

    return issueAuthSession(platformUserId);
  } catch (error) {
    if (createdUser) {
      await UserCollection.deleteOne({ _id: user._id });
    }
    throw error;
  }
};

export const loginService = async ({ login, password }: LoginPayload): Promise<AuthSession> => {
  const normalizedLogin = normalizeLogin(login);
  const account = await PasswordAccountCollection.findOne({ login: normalizedLogin }).select("+passwordHash");

  if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
    throw createHttpError(401, "Invalid login or password");
  }

  const user = await UserCollection.findOne({ userId: account.userId });
  if (!user || !user.isActive) {
    throw createHttpError(401, "Invalid login or password");
  }

  return issueAuthSession(account.userId);
};

export const refreshService = async (refreshToken: string): Promise<AuthSession> => {
  const tokenRecord = ensureValidRefreshToken(await findRefreshTokenRecord(refreshToken));
  tokenRecord.revokedAt = new Date();
  await tokenRecord.save();

  return issueAuthSession(tokenRecord.userId);
};

export const logoutService = async (refreshToken: string) => {
  const tokenRecord = await findRefreshTokenRecord(refreshToken);
  if (tokenRecord && !tokenRecord.revokedAt && tokenRecord.expiresAt.getTime() > Date.now()) {
    tokenRecord.revokedAt = new Date();
    await tokenRecord.save();
  }
};

export const requestResetEmailService = async (loginOrEmail: string) => {
  void loginOrEmail;
  return { message: "Password reset flow is not configured" };
};

export const resetPasswordService = async ({
  loginOrEmail,
  code,
  newPassword,
}: ResetPasswordPayload) => {
  void code;

  if (!newPassword || newPassword.length < 8) {
    throw createHttpError(400, "Password must be at least 8 characters");
  }

  const normalized = normalizeLogin(loginOrEmail);
  let account = await PasswordAccountCollection.findOne({ login: normalized }).select("+passwordHash");

  if (!account) {
    const user = await UserCollection.findOne({ email: normalizeEmail(loginOrEmail) });
    if (user) {
      const platformUserId = await ensurePlatformUserId(user);
      account = await PasswordAccountCollection.findOne({ userId: platformUserId }).select("+passwordHash");
    }
  }

  if (!account) {
    throw createHttpError(404, "User not found");
  }

  account.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await account.save();
  await RefreshTokenCollection.updateMany({ userId: account.userId, revokedAt: null }, { revokedAt: new Date() });

  return { message: "Password successfully reset" };
};

export const confirmEmailService = async () => {
  return { message: "Email confirmation is not required" };
};

export const disableUserService = async (loginOrEmail: string) => {
  const login = normalizeLogin(loginOrEmail);
  const account = await PasswordAccountCollection.findOne({ login });
  const user =
    (account ? await UserCollection.findOne({ userId: account.userId }) : null) ??
    (await UserCollection.findOne({ email: normalizeEmail(loginOrEmail) }));

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const platformUserId = await ensurePlatformUserId(user);
  user.isActive = false;
  await user.save();
  await RefreshTokenCollection.updateMany({ userId: platformUserId, revokedAt: null }, { revokedAt: new Date() });

  return { message: "User has been disabled successfully" };
};

export const enableUserService = async (loginOrEmail: string) => {
  const login = normalizeLogin(loginOrEmail);
  const account = await PasswordAccountCollection.findOne({ login });
  const user =
    (account ? await UserCollection.findOne({ userId: account.userId }) : null) ??
    (await UserCollection.findOne({ email: normalizeEmail(loginOrEmail) }));

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  await ensurePlatformUserId(user);
  user.isActive = true;
  await user.save();
  return { message: "User has been enabled successfully" };
};
