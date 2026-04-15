import type { Request } from "express";
import createHttpError from "http-errors";

export type RequestAuth = {
  userId: string;
  issuedAt: number;
  expiresAt: number;
  authToken: string;
};

export const requireAuthUser = (req: Request) => {
  if (!req.auth?.userId) {
    throw createHttpError(401, "Unauthorized");
  }

  return req.auth;
};
