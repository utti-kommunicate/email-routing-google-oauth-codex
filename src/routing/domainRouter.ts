import { InboundEmail, RouteTarget } from "../types.js";

const domainRoutes: Record<string, RouteTarget> = {
  "customer.com": {
    queueName: "customer-success",
    reason: "Known customer domain"
  },
  "vendor.com": {
    queueName: "vendor-ops",
    reason: "Known vendor domain"
  },
  "example.org": {
    queueName: "partnerships",
    reason: "Partner organization"
  }
};

const defaultRoute: RouteTarget = {
  queueName: "general-triage",
  reason: "No sender-domain route matched"
};

export function senderDomain(email: InboundEmail): string {
  const match = email.from.toLowerCase().match(/@([^>\s]+)>?$/);
  return match?.[1] ?? "unknown";
}

export function routeBySenderDomain(email: InboundEmail): RouteTarget {
  return domainRoutes[senderDomain(email)] ?? defaultRoute;
}
