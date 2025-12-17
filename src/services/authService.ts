import AWS from "aws-sdk";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  type ISignUpResult,
} from "amazon-cognito-identity-js";
import crypto from "crypto";

import { CLIENT_ID, USER_POOL_ID } from "../helpers/constants.js";
import { createPatient } from "./patientsService.js";
import { createUser } from "./userService.js";
import { Patient } from "../database/models/patients.js";

type CognitoIdentityClient = {
  promisifyRequest: <T = unknown>(operation: string, params: Record<string, unknown>) => Promise<T>;
};

const poolData = {
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);
const cognitoClient = (userPool as unknown as { client: CognitoIdentityClient }).client;
const cognito = new AWS.CognitoIdentityServiceProvider();

export type AuthSession = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  cognitoSub?: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string | Date;
  sex?: Patient["sex"];
  phone?: string;
  diagnosisType?: Patient["diagnosisType"];
  timezone?: string;
  preferredLanguage?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
};

type ConfirmEmailPayload = {
  email: string;
  code: string;
};

type AuthenticationResult = {
  AccessToken?: string;
  IdToken?: string;
  RefreshToken?: string;
};

const getCognitoUser = (email: string) => new CognitoUser({ Username: email, Pool: userPool });

const decodeSub = (idToken?: string) => {
  if (!idToken) return undefined;

  try {
    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1] ?? "", "base64url").toString("utf8")
    );
    return payload.sub as string | undefined;
  } catch {
    return undefined;
  }
};

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const mapAuthResult = (authResult: AuthenticationResult, fallbackRefreshToken?: string): AuthSession => {
  const accessToken = authResult.AccessToken;
  const idToken = authResult.IdToken;
  const refreshToken = authResult.RefreshToken ?? fallbackRefreshToken;

  if (!accessToken || !idToken || !refreshToken) {
    throw new Error("Failed to create auth session");
  }

  return {
    accessToken,
    idToken,
    refreshToken,
    cognitoSub: decodeSub(idToken),
  };
};

const mapCognitoSession = (session: CognitoUserSession): AuthSession => ({
  accessToken: session.getAccessToken().getJwtToken(),
  idToken: session.getIdToken().getJwtToken(),
  refreshToken: session.getRefreshToken().getToken(),
  cognitoSub: decodeSub(session.getIdToken().getJwtToken()),
});

const signUpUser = async (email: string, password: string): Promise<ISignUpResult> =>
  new Promise((resolve, reject) => {
    const attributes = [new CognitoUserAttribute({ Name: "email", Value: email })];

    userPool.signUp(email, password, attributes, [], (err, result) => {
      if (err || !result) {
        reject(err ?? new Error("Failed to register user"));
        return;
      }

      resolve(result);
    });
  });

const authenticateUser = async (email: string, password: string): Promise<CognitoUserSession> => {
  const cognitoUser = getCognitoUser(email);

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return await new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => reject(new Error("New password required")),
      mfaRequired: (_challengeName, challengeParameters) =>
        reject(
          new Error(
            `MFA required: ${typeof challengeParameters === "object" ? JSON.stringify(challengeParameters) : ""}`
          )
        ),
      customChallenge: (challengeParameters) =>
        reject(
          new Error(
            `Custom challenge required: ${
              typeof challengeParameters === "object" ? JSON.stringify(challengeParameters) : ""
            }`
          )
        ),
    });
  });
};

export const registerUserService = async ({
  email,
  password,
  fullName,
  dateOfBirth,
  sex,
  phone,
  diagnosisType,
  timezone,
  preferredLanguage,
}: RegisterPayload) => {
  const { userSub } = await signUpUser(email, password);

  if (!userSub) {
    throw new Error("Failed to register user");
  }

  const role: "PATIENT" = "PATIENT";

  const user = await createUser({
    email,
    passwordHash: hashPassword(password),
    cognitoSub: userSub,
    role,
  });

  const parsedDob = new Date(dateOfBirth);
  if (isNaN(parsedDob.getTime())) {
    throw new Error("Invalid dateOfBirth");
  }

  const patient = await createPatient({
    userId: user._id as Patient["userId"],
    fullName,
    dateOfBirth: parsedDob,
    sex: sex ?? undefined,
    phone,
    diagnosisType: diagnosisType ?? undefined,
    timezone,
    preferredLanguage,
  });

  return {
    message: "Patient registered successfully",
    userSub,
    userId: user._id,
    patientId: patient._id,
  };
};

export const loginService = async ({ email, password }: LoginPayload): Promise<AuthSession> => {
  const session = await authenticateUser(email, password);
  return mapCognitoSession(session);
};

export const logoutService = async (accessToken: string) => {
  await cognitoClient.promisifyRequest("GlobalSignOut", { AccessToken: accessToken });

  return { message: "Logged out successfully" };
};

export const refreshService = async (refreshToken: string): Promise<AuthSession> => {
  const authResponse = await cognitoClient.promisifyRequest<{
    AuthenticationResult?: AuthenticationResult;
  }>("InitiateAuth", {
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  });

  if (!authResponse.AuthenticationResult) {
    throw new Error("Failed to refresh session");
  }

  return mapAuthResult(authResponse.AuthenticationResult, refreshToken);
};

export const requestResetEmailService = async (email: string) => {
  const cognitoUser = getCognitoUser(email);

  await new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: resolve,
      onFailure: reject,
    });
  });

  return { message: "Password reset email sent" };
};

export const resetPasswordService = async ({ email, code, newPassword }: ResetPasswordPayload) => {
  const cognitoUser = getCognitoUser(email);

  await new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: resolve,
      onFailure: reject,
    });
  });

  return { message: "Password successfully reset" };
};

export const confirmEmailService = async ({ email, code }: ConfirmEmailPayload) => {
  const cognitoUser = getCognitoUser(email);

  await new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, false, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });

  return { message: "Email successfully confirmed" };
};

export const disableUserService = async (email: string) => {
  try {
    await cognito
      .adminDisableUser({
        UserPoolId: USER_POOL_ID,
        Username: email,
      })
      .promise();

    return { message: "User has been disabled successfully" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to disable user: ${message}`);
  }
};

export const enableUserService = async (email: string) => {
  try {
    await cognito
      .adminEnableUser({
        UserPoolId: USER_POOL_ID,
        Username: email,
      })
      .promise();

    return { message: "User has been enabled successfully" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to enable user: ${message}`);
  }
};
