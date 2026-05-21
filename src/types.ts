export type OAuthTokenRecord = {
  userId: string;
  provider: "google";
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  scopes: string[];
};

export type InboundEmail = {
  id: string;
  provider: "google";
  mailboxUserId: string;
  from: string;
  to: string[];
  subject?: string;
  text?: string;
  receivedAt: string;
  raw?: unknown;
};

export type RouteTarget = {
  queueName: string;
  reason: string;
};

export type QueuedEmailJob = {
  id: string;
  target: RouteTarget;
  email: InboundEmail;
  attempts: number;
  enqueuedAt: string;
};
