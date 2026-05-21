# Email Routing Architecture with Google OAuth

This is a minimal Node.js/TypeScript scaffold for connecting a Google mailbox, ingesting inbound email payloads, routing by sender domain, and placing work onto a simple queue.

## Architecture

```mermaid
sequenceDiagram
  participant User
  participant App
  participant Google
  participant Ingestion
  participant Router
  participant Queue

  User->>App: GET /oauth/google/start?userId=123
  App->>Google: Redirect to OAuth consent
  Google->>App: GET /oauth/google/callback?code=...&state=...
  App->>App: Verify state and store tokens
  Google-->>Ingestion: Gmail push/webhook adapter posts email
  Ingestion->>Router: Normalize inbound email
  Router->>Router: Match sender domain
  Router->>Queue: Enqueue job by route target

## OAuth 2.0 Flow
* Client calls GET /oauth/google/start?userId=<id>.
* The service creates a signed state value and redirects to Google's OAuth consent screen.
* Google redirects to /oauth/google/callback with code and state.
* The service verifies state, exchanges code for tokens, and stores the token record.

##Production notes:
* Store tokens in a database or secret store, not memory.
* Encrypt refresh tokens at rest.
* Request only the Gmail scopes your ingestion model needs.
* Use Google Pub/Sub Gmail push notifications or a polling worker to fetch new messages, then post normalized email data into /email/ingest.

##Email Ingestion Endpoint
{
  "mailboxUserId": "user_123",
  "from": "founder@customer.com",
  "to": ["support@yourcompany.com"],
  "subject": "Need help",
  "text": "Can someone look at this?"
}

The endpoint validates the payload, routes it by sender domain, and returns 202 Accepted with the queue selected.

## Routing Logic
Routes live in src/routing/domainRouter.ts.

customer.com routes to customer-success
vendor.com routes to vendor-ops
example.org routes to partnerships
everything else routes to general-triage
Simple Queue
src/queue/simpleQueue.ts contains an in-memory FIFO queue keyed by queue name. This is intentionally tiny for the routing test. In production, replace it with Redis/BullMQ, SQS, Pub/Sub, or another durable queue.

## Core Structure
src/
  auth/googleOAuth.ts       OAuth URL generation, state signing, code exchange
  config.ts                 Environment parsing
  ingestion/emailIngestion.ts
  queue/simpleQueue.ts
  routing/domainRouter.ts
  server.ts                 Express routes
  store/tokenStore.ts       In-memory token persistence
  types.ts

## Run
npm install
cp .env.example .env
npm run dev

