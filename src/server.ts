import express from "express";
import { buildGoogleAuthUrl, exchangeGoogleCode, verifyOAuthState } from "./auth/googleOAuth.js";
import { config } from "./config.js";
import { parseInboundEmail } from "./ingestion/emailIngestion.js";
import { enqueueEmail, listQueues } from "./queue/simpleQueue.js";
import { routeBySenderDomain } from "./routing/domainRouter.js";
import { saveToken } from "./store/tokenStore.js";

const app = express();

app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/oauth/google/start", (req, res) => {
  const userId = String(req.query.userId ?? "");
  if (!userId) {
    res.status(400).json({ error: "Missing userId query parameter" });
    return;
  }

  res.redirect(buildGoogleAuthUrl(userId));
});

app.get("/oauth/google/callback", async (req, res, next) => {
  try {
    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");
    if (!code || !state) {
      res.status(400).json({ error: "Missing OAuth code or state" });
      return;
    }

    const { userId } = verifyOAuthState(state);
    const tokenRecord = await exchangeGoogleCode(userId, code);
    await saveToken(tokenRecord);

    res.json({ connected: true, provider: "google", userId });
  } catch (error) {
    next(error);
  }
});

app.post("/email/ingest", (req, res, next) => {
  try {
    const email = parseInboundEmail(req.body);
    const target = routeBySenderDomain(email);
    const job = enqueueEmail(target, email);

    res.status(202).json({
      accepted: true,
      jobId: job.id,
      queueName: target.queueName,
      routeReason: target.reason
    });
  } catch (error) {
    next(error);
  }
});

app.get("/queues", (_req, res) => {
  res.json(listQueues());
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  res.status(400).json({ error: message });
});

app.listen(config.PORT, () => {
  console.log(`Email routing service listening on port ${config.PORT}`);
});
