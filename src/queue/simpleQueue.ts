import { randomUUID } from "node:crypto";
import { QueuedEmailJob, RouteTarget, InboundEmail } from "../types.js";

const queues = new Map<string, QueuedEmailJob[]>();

export function enqueueEmail(target: RouteTarget, email: InboundEmail): QueuedEmailJob {
  const job: QueuedEmailJob = {
    id: randomUUID(),
    target,
    email,
    attempts: 0,
    enqueuedAt: new Date().toISOString()
  };

  const queue = queues.get(target.queueName) ?? [];
  queue.push(job);
  queues.set(target.queueName, queue);

  return job;
}

export function dequeueEmail(queueName: string): QueuedEmailJob | undefined {
  return queues.get(queueName)?.shift();
}

export function listQueues(): Record<string, QueuedEmailJob[]> {
  return Object.fromEntries(queues.entries());
}
