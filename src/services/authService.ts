import AWS from "aws-sdk";

import { CLIENT_ID, USER_POOL_ID } from "../helpers/constants.js";
import { createUser } from "./userService.js";

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
  group?: string;
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

const mapAuthResult = (
  authResult: AWS.CognitoIdentityServiceProvider.AuthenticationResultType,
  fallbackRefreshToken?: string
): AuthSession => {
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

export const registerUserService = async ({
  email,
  password,
  group,
}: RegisterPayload) => {
  const { UserSub } = await cognito
    .signUp({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    })
    .promise();

  if (!UserSub) {
    throw new Error("Failed to register user");
  }

  const role = (group?.toUpperCase() as "PATIENT" | "DOCTOR" | "ADMIN") ?? "PATIENT";

  if (group) {
    await cognito
      .adminAddUserToGroup({
        UserPoolId: USER_POOL_ID,
        Username: email,
        GroupName: group,
      })
      .promise();
  }

  await createUser({
    email,
    passwordHash: password,
    cognitoSub: UserSub,
    role,
  });

  return {
    message: group ? "User registered and added to group" : "User registered successfully",
    userSub: UserSub,
  };
};

export const loginService = async ({ email, password }: LoginPayload): Promise<AuthSession> => {
  const authResponse = await cognito
    .initiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })
    .promise();

  if (!authResponse.AuthenticationResult) {
    throw new Error("Failed to login user");
  }

  return mapAuthResult(authResponse.AuthenticationResult);
};

export const logoutService = async (accessToken: string) => {
  await cognito
    .globalSignOut({
      AccessToken: accessToken,
    })
    .promise();

  return { message: "Logged out successfully" };
};

export const refreshService = async (refreshToken: string): Promise<AuthSession> => {
  const authResponse = await cognito
    .initiateAuth({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    })
    .promise();

  if (!authResponse.AuthenticationResult) {
    throw new Error("Failed to refresh session");
  }

  return mapAuthResult(authResponse.AuthenticationResult, refreshToken);
};

export const requestResetEmailService = async (email: string) => {
  await cognito
    .forgotPassword({
      ClientId: CLIENT_ID,
      Username: email,
    })
    .promise();

  return { message: "Password reset email sent" };
};

export const resetPasswordService = async ({ email, code, newPassword }: ResetPasswordPayload) => {
  await cognito
    .confirmForgotPassword({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    })
    .promise();

  return { message: "Password successfully reset" };
};

export const confirmEmailService = async ({ email, code }: ConfirmEmailPayload) => {
  await cognito
    .confirmSignUp({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    })
    .promise();

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
