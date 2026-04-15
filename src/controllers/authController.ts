import { RequestHandler } from "express";
import createHttpError from "http-errors";

import * as authServices from "../services/authService.js";
import type { Patient } from "../database/models/patients.js";
import { requireBearerToken } from "../helpers/appTokens.js";
import { requireAuthUser } from "../helpers/auth.js";

export const registerUserController: RequestHandler = async (req, res, next) => {
  try {
    const {
      login,
      email,
      password,
      name,
      fullName,
      dateOfBirth,
      sex,
      phone,
      diagnosisType,
      timezone,
      preferredLanguage,
    } = req.body as {
      login?: string;
      email: string;
      password: string;
      name?: string;
      fullName?: string;
      dateOfBirth?: string | Date;
      sex?: Patient["sex"];
      phone?: string;
      diagnosisType?: Patient["diagnosisType"];
      timezone?: string;
      preferredLanguage?: string;
    };

    const normalizedLogin = login ?? email;
    if (!normalizedLogin || !password) {
      throw createHttpError(400, "Missing required registration fields");
    }

    const allowedSex: Patient["sex"][] = ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"];
    const normalizedSex = sex && allowedSex.includes(sex) ? sex : undefined;

    const allowedDiagnosis: Patient["diagnosisType"][] = ["NONE", "EPISODIC_MIGRAINE", "CHRONIC_MIGRAINE", "OTHER"];
    const normalizedDiagnosis = diagnosisType && allowedDiagnosis.includes(diagnosisType) ? diagnosisType : undefined;

    const result = await authServices.registerUserService({
      login: normalizedLogin,
      email,
      password,
      name,
      fullName,
      dateOfBirth,
      sex: normalizedSex,
      phone,
      diagnosisType: normalizedDiagnosis,
      timezone,
      preferredLanguage,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Registration error", err);
    next(err);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const { login, email, password } = req.body as { login?: string; email?: string; password: string };
    const normalizedLogin = login ?? email;

    if (!normalizedLogin || !password) {
      throw createHttpError(400, "Missing login or password");
    }

    const session = await authServices.loginService({ login: normalizedLogin, password });

    res.status(200).json({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      tokenType: "Bearer",
    });
  } catch (err) {
    console.error("Login error", err);
    next(err);
  }
};

export const oauthController: RequestHandler = async (req, res, next) => {
  try {
    const { provider, identityToken, authorizationCode, email, name } = req.body as {
      provider?: "google" | "apple";
      identityToken?: string;
      authorizationCode?: string;
      email?: string;
      name?: string;
    };

    if (!provider || !identityToken) {
      throw createHttpError(400, "provider and identityToken are required");
    }

    const session = await authServices.oauthService({
      provider,
      identityToken,
      authorizationCode,
      email,
      name,
    });

    res.status(200).json({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      tokenType: "Bearer",
    });
  } catch (err) {
    next(err);
  }
};

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = requireBearerToken(req.headers.authorization);
    await authServices.logoutService(refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = requireBearerToken(req.headers.authorization);
    const session = await authServices.refreshService(refreshToken);

    res.status(200).json({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      tokenType: "Bearer",
    });
  } catch (err) {
    next(err);
  }
};

export const requestResetEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email, login } = req.body as { email?: string; login?: string };
    await authServices.requestResetEmailService(login ?? email ?? "");
    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController: RequestHandler = async (req, res, next) => {
  try {
    const { email, login, code, newPassword } = req.body as {
      email?: string;
      login?: string;
      code: string;
      newPassword: string;
    };
    await authServices.resetPasswordService({ loginOrEmail: login ?? email ?? "", code, newPassword });
    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    next(err);
  }
};

export const confirmEmailController: RequestHandler = async (req, res, next) => {
  try {
    void (req.body as { email?: string; code?: string });
    await authServices.confirmEmailService();
    res.status(200).json({ message: "Email confirmation is not required" });
  } catch (err) {
    next(err);
  }
};

export const meController: RequestHandler = (req, res, next) => {
  try {
    requireAuthUser(req);
    if (!req.user) throw createHttpError(401, "Unauthorized");
    res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
};
