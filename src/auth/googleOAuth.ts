import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { config, googleRedirectUri } from "../config.js";
import { OAuthTokenRecord } from "../types.js";

const googleOAuthClient = new OAuth2Client({
  clientId: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  redirectUri: googleRedirectUri
});

const scopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly"
];

export function createOAuthState(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, nonce: crypto.randomUUID(), ts: Date.now() })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", config.OAUTH_STATE_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyOAuthState(state: string): { userId: string } {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid OAuth state");
  }

  const expected = crypto
    .createHmac("sha256", config.OAUTH_STATE_SECRET)
    .update(payload)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid OAuth state signature");
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (!parsed.userId || Date.now() - parsed.ts > 10 * 60 * 1000) {
    throw new Error("Expired OAuth state");
  }

  return { userId: parsed.userId };
}

export function buildGoogleAuthUrl(userId: string): string {
  return googleOAuthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state: createOAuthState(userId)
  });
}

export async function exchangeGoogleCode(
  userId: string,
  code: string
): Promise<OAuthTokenRecord> {
  const { tokens } = await googleOAuthClient.getToken(code);

  if (!tokens.access_token) {
    throw new Error("Google did not return an access token");
  }

  return {
    userId,
    provider: "google",
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
    expiryDate: tokens.expiry_date ?? undefined,
    scopes
  };
}
