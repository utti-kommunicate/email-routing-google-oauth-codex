import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  PUBLIC_BASE_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_PATH: z.string().default("/oauth/google/callback"),
  OAUTH_STATE_SECRET: z.string().min(16)
});

export const config = EnvSchema.parse(process.env);

export const googleRedirectUri = new URL(
  config.GOOGLE_REDIRECT_PATH,
  config.PUBLIC_BASE_URL
).toString();
