import { RequestHandler } from "express";
import createHttpError from "http-errors";

import * as authServices from "../services/authService.js";
import type { Patient } from "../database/models/patients.js";

export const registerUserController: RequestHandler = async (req, res, next) => {
  try {
    const {
      email,
      password,
      fullName,
      dateOfBirth,
      sex,
      phone,
      diagnosisType,
      timezone,
      preferredLanguage,
    } = req.body as {
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

    if (!email || !password || !fullName || !dateOfBirth) {
      throw createHttpError(400, "Missing required registration fields");
    }

    const allowedSex: Patient["sex"][] = ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"];
    const normalizedSex = sex && allowedSex.includes(sex) ? sex : undefined;

    const allowedDiagnosis: Patient["diagnosisType"][] = ["NONE", "EPISODIC_MIGRAINE", "CHRONIC_MIGRAINE", "OTHER"];
    const normalizedDiagnosis = diagnosisType && allowedDiagnosis.includes(diagnosisType) ? diagnosisType : undefined;

    const result = await authServices.registerUserService({
      email,
      password,
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
    const { email, password } = req.body as { email: string; password: string };

    const session = await authServices.loginService({ email, password });

    res.status(200).json({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      idToken: session.idToken,
      tokenType: "Bearer",
    });
    
  } catch (err) {
    console.error("Login error", err);
    next(err);
  }
};

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createHttpError(400, "Missing Authorization header");
    }

    const [bearer, accessToken] = authHeader.split(" ");

    if (bearer !== "Bearer" || !accessToken) {
      throw createHttpError(400, "Authorization header should be Bearer <token>");
    }

    await authServices.logoutService(accessToken);

    res.status(200).json({ message: "Logged out successfully!" });
  } catch (err) {
    next(err);
  }
};

export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      res.status(400).json({ message: "Missing refreshToken" });
      return;
    }

    const session = await authServices.refreshService(refreshToken);

    res.status(200).json({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      idToken: session.idToken,
      tokenType: "Bearer",
    });
  } catch (err) {
    next(err);
  }
};

export const requestResetEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body as { email: string };
    await authServices.requestResetEmailService(email);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController: RequestHandler = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body as {
      email: string;
      code: string;
      newPassword: string;
    };
    await authServices.resetPasswordService({ email, code, newPassword });
    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    next(err);
  }
};

export const confirmEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email, code } = req.body as { email: string; code: string };
    await authServices.confirmEmailService({ email, code });
    res.status(200).json({ message: "Email confirmed successfully!" });
  } catch (err) {
    next(err);
  }
};

export const meController: RequestHandler = (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, "Unauthorized");
    }
    res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
};
