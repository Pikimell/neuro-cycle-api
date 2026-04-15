import crypto from "crypto";
import createHttpError from "http-errors";

import {
  APP_ACCESS_TOKEN_SECRET,
  APP_ACCESS_TOKEN_TTL,
  APP_REFRESH_TOKEN_SECRET,
  APP_REFRESH_TOKEN_TTL,
} from "./constants.js";

export type AccessTokenPayload = {
  user_id: string;
  iat: number;
  exp: number;
  token_type: "access";
};

const encodeBase64Url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

const decodeBase64UrlJson = <T>(value: string): T => {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
};

export const hashRefreshToken = (refreshToken: string) =>
  crypto.createHmac("sha256", APP_REFRESH_TOKEN_SECRET).update(refreshToken).digest("hex");

export const generateRefreshToken = () => crypto.randomBytes(48).toString("base64url");

export const getRefreshTokenExpiry = () => new Date(Date.now() + APP_REFRESH_TOKEN_TTL * 1000);

export const signAccessToken = (userId: string) => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + APP_ACCESS_TOKEN_TTL;

  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      user_id: userId,
      iat,
      exp,
      token_type: "access",
    } satisfies AccessTokenPayload)
  );
  const signature = crypto
    .createHmac("sha256", APP_ACCESS_TOKEN_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return {
    accessToken: `${header}.${payload}.${signature}`,
    expiresIn: APP_ACCESS_TOKEN_TTL,
  };
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      return null;
    }

    const header = decodeBase64UrlJson<{ alg?: string; typ?: string }>(encodedHeader);
    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", APP_ACCESS_TOKEN_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const actualSignature = Buffer.from(encodedSignature, "base64url");

    if (
      expectedSignature.length !== actualSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, actualSignature)
    ) {
      return null;
    }

    const payload = decodeBase64UrlJson<Partial<AccessTokenPayload>>(encodedPayload);
    if (
      payload.token_type !== "access" ||
      typeof payload.user_id !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
};

export const getBearerToken = (authorizationHeader?: string | null) => {
  if (!authorizationHeader) {
    return null;
  }

  const [bearer, token] = authorizationHeader.split(" ");
  if (bearer !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const requireBearerToken = (authorizationHeader?: string | null) => {
  const token = getBearerToken(authorizationHeader);
  if (!token) {
    throw createHttpError(401, "Authorization header should be Bearer <token>");
  }
  return token;
};
