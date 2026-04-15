import crypto from "crypto";
import createHttpError from "http-errors";

type JwtHeader = {
  alg?: string;
  kid?: string;
  typ?: string;
};

type Jwk = {
  kid?: string;
  alg?: string;
  use?: string;
  kty?: string;
  n?: string;
  e?: string;
  x5c?: string[];
};

type JwksResponse = {
  keys?: Jwk[];
};

const ONE_HOUR_MS = 60 * 60 * 1000;

const jwksCache = new Map<string, { expiresAt: number; keys: Jwk[] }>();

const parseJson = <T>(value: string) => JSON.parse(value) as T;

const getJwtHeader = (token: string): JwtHeader => {
  const [encodedHeader] = token.split(".");
  if (!encodedHeader) {
    throw createHttpError(401, "Invalid identity token");
  }

  try {
    return parseJson<JwtHeader>(Buffer.from(encodedHeader, "base64url").toString("utf8"));
  } catch {
    throw createHttpError(401, "Invalid identity token");
  }
};

const getJwks = async (jwksUrl: string) => {
  const cached = jwksCache.get(jwksUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.keys;
  }

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw createHttpError(401, "Failed to load provider keys");
  }

  const body = (await response.json()) as JwksResponse;
  if (!Array.isArray(body.keys)) {
    throw createHttpError(401, "Invalid provider keys");
  }

  jwksCache.set(jwksUrl, { keys: body.keys, expiresAt: Date.now() + ONE_HOUR_MS });
  return body.keys;
};

export const verifyRs256Jwt = async (token: string, jwksUrl: string) => {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw createHttpError(401, "Invalid identity token");
  }

  const header = getJwtHeader(token);
  if (header.alg !== "RS256" || !header.kid) {
    throw createHttpError(401, "Unsupported identity token");
  }

  const keys = await getJwks(jwksUrl);
  const jwk = keys.find((item) => item.kid === header.kid);
  if (!jwk) {
    throw createHttpError(401, "Provider key not found");
  }

  let publicKey: crypto.KeyObject;
  try {
    publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  } catch {
    throw createHttpError(401, "Invalid provider key");
  }

  const isValid = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    publicKey,
    Buffer.from(encodedSignature, "base64url")
  );

  if (!isValid) {
    throw createHttpError(401, "Invalid identity token signature");
  }

  try {
    return parseJson<Record<string, unknown>>(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw createHttpError(401, "Invalid identity token payload");
  }
};
