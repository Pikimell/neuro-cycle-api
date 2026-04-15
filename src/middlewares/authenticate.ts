import createHttpError from "http-errors";
import type { RequestHandler } from "express";

import { UserCollection } from "../database/models/user.js";
import { verifyAccessToken, getBearerToken } from "../helpers/appTokens.js";

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      req.auth = undefined;
      req.user = undefined;
      req.typeAccount = null;
      return next();
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      req.auth = undefined;
      req.user = undefined;
      req.typeAccount = null;
      return next();
    }

    const user = await UserCollection.findOne({ userId: payload.user_id });
    if (!user || !user.isActive) {
      throw createHttpError(401, "User not found associated with this token.");
    }

    req.auth = {
      userId: payload.user_id,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
      authToken: token,
    };
    req.user = user;
    req.typeAccount = user.role ?? null;
    next();
  } catch (err) {
    req.auth = undefined;
    req.user = undefined;
    req.typeAccount = null;
    next();
  }
};
