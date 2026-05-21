import { z } from "zod";
import { InboundEmail } from "../types.js";

const EmailPayloadSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  provider: z.literal("google").default("google"),
  mailboxUserId: z.string().min(1),
  from: z.string().email().or(z.string().includes("@")),
  to: z.array(z.string()).default([]),
  subject: z.string().optional(),
  text: z.string().optional(),
  receivedAt: z.string().datetime().default(() => new Date().toISOString()),
  raw: z.unknown().optional()
});

export function parseInboundEmail(payload: unknown): InboundEmail {
  return EmailPayloadSchema.parse(payload);
}
