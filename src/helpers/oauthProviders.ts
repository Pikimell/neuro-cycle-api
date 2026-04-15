import createHttpError from "http-errors";

import {
  ALLOWED_OAUTH_PROVIDERS,
  APPLE_CLIENT_ID,
  APPLE_KEYS_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_KEYS_URL,
} from "./constants.js";
import { verifyRs256Jwt } from "./jwks.js";

export type OAuthProvider = "google" | "apple";

export type ResolvedIdentity = {
  provider: OAuthProvider;
  providerUserId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
};

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? null;

const readString = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

const readBoolean = (value: unknown) => value === true || value === "true";

const ensureProvider = (provider: string): OAuthProvider => {
  if (!ALLOWED_OAUTH_PROVIDERS.has(provider as OAuthProvider)) {
    throw createHttpError(400, "Unsupported provider");
  }

  return provider as OAuthProvider;
};

const validateCommonClaims = (
  payload: Record<string, unknown>,
  issuers: string[],
  audience: string
) => {
  const issuer = readString(payload.iss);
  const subject = readString(payload.sub);
  const exp = typeof payload.exp === "number" ? payload.exp : Number(payload.exp);
  const audClaim = payload.aud;
  const audienceMatches =
    audClaim === audience || (Array.isArray(audClaim) && audClaim.includes(audience));

  if (!issuer || !issuers.includes(issuer)) {
    throw createHttpError(401, "Invalid token issuer");
  }

  if (!audienceMatches) {
    throw createHttpError(401, "Invalid token audience");
  }

  if (!subject) {
    throw createHttpError(401, "Missing token subject");
  }

  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) {
    throw createHttpError(401, "Identity token expired");
  }

  return { issuer, subject, exp };
};

const verifyGoogleIdentityToken = async (identityToken: string): Promise<ResolvedIdentity> => {
  const payload = await verifyRs256Jwt(identityToken, GOOGLE_KEYS_URL);
  const { subject } = validateCommonClaims(
    payload,
    ["accounts.google.com", "https://accounts.google.com"],
    GOOGLE_CLIENT_ID
  );

  return {
    provider: "google",
    providerUserId: subject,
    email: normalizeEmail(readString(payload.email)),
    emailVerified: true,
    name: readString(payload.name),
  };
};

const verifyAppleIdentityToken = async (
  identityToken: string,
  bodyEmail?: string | null,
  bodyName?: string | null
): Promise<ResolvedIdentity> => {
  const payload = await verifyRs256Jwt(identityToken, APPLE_KEYS_URL);
  const { subject } = validateCommonClaims(payload, ["https://appleid.apple.com"], APPLE_CLIENT_ID);

  return {
    provider: "apple",
    providerUserId: subject,
    email: normalizeEmail(readString(payload.email) ?? bodyEmail ?? null),
    emailVerified: readBoolean(payload.email_verified),
    name: readString(payload.name) ?? readString(bodyName),
  };
};

export const verifyProviderIdentityToken = async (params: {
  provider: string;
  identityToken: string;
  email?: string | null;
  name?: string | null;
}) => {
  const provider = ensureProvider(params.provider);

  if (!params.identityToken) {
    throw createHttpError(400, "identityToken is required");
  }

  if (provider === "google") {
    return verifyGoogleIdentityToken(params.identityToken);
  }

  return verifyAppleIdentityToken(params.identityToken, params.email, params.name);
};
