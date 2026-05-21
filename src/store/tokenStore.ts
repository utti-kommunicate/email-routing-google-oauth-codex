import { OAuthTokenRecord } from "../types.js";

const tokensByUserId = new Map<string, OAuthTokenRecord>();

export async function saveToken(record: OAuthTokenRecord): Promise<void> {
  tokensByUserId.set(record.userId, record);
}

export async function getToken(userId: string): Promise<OAuthTokenRecord | undefined> {
  return tokensByUserId.get(userId);
}
