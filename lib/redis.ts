import "server-only";
import Redis from "ioredis";

export class RedisUnavailableError extends Error {
  constructor() {
    super("This service is temporarily unavailable. Please try again shortly.");
    this.name = "RedisUnavailableError";
  }
}

type RedisState = {
  client?: Redis;
  connecting?: Promise<void>;
  retryAt: number;
};
const globals = globalThis as typeof globalThis & { rhRedis?: RedisState };
const state = (globals.rhRedis ??= { retryAt: 0 });

// Use distinct prefixes if staging and production share a Redis database.
export function redisKey(key: string) {
  return `${process.env.REDIS_KEY_PREFIX || `rh:${process.env.NODE_ENV || "development"}`}:${key}`;
}

export async function getRedis(): Promise<Redis> {
  const url = process.env.REDIS_URL;
  if (!url || Date.now() < state.retryAt) throw new RedisUnavailableError();
  try {
    if (!state.client) {
      const parsed = new URL(url);
      if (!["redis:", "rediss:"].includes(parsed.protocol)) throw new Error();
      state.client = new Redis(url, {
        lazyConnect: true,
        enableOfflineQueue: false,
        enableReadyCheck: false,
        connectTimeout: 2000,
        commandTimeout: 2000,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
        autoResendUnfulfilledCommands: false,
      });
      // Never log connection errors: provider errors may contain the connection URL.
      state.client.on("error", () => {});
    }
    const client = state.client;
    if (client.status !== "ready") {
      state.connecting ??= client
        .connect()
        .then(() => {})
        .finally(() => {
          state.connecting = undefined;
        });
      await state.connecting;
    }
    return client;
  } catch {
    state.client?.disconnect();
    state.client = undefined;
    state.retryAt = Date.now() + 5000;
    throw new RedisUnavailableError();
  }
}
