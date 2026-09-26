import { Redis } from "@upstash/redis";
import type { GameState } from "./types";

const GAME_KEY = "two-flocks:game";
const LOCK_KEY = "two-flocks:lock";

const memory = globalThis as unknown as {
  __twoFlocksGame?: GameState;
  __twoFlocksRedis?: Redis | null;
  __twoFlocksRedisResolved?: boolean;
};

function emptyState(): GameState {
  return {
    phase: "lobby",
    players: [],
    deckConfig: { excluded: [], replacements: [] },
    deck: [],
    dealGeneration: 0,
    version: 0,
  };
}

/** Supports Upstash free Redis and Vercel KV (same REST env vars). */
export function getRedis(): Redis | null {
  if (memory.__twoFlocksRedisResolved) {
    return memory.__twoFlocksRedis ?? null;
  }

  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  memory.__twoFlocksRedisResolved = true;
  if (url && token) {
    memory.__twoFlocksRedis = new Redis({ url, token });
  } else {
    memory.__twoFlocksRedis = null;
  }
  return memory.__twoFlocksRedis;
}

export function usingPersistentStore(): boolean {
  return getRedis() !== null;
}

export async function loadGame(): Promise<GameState> {
  const redis = getRedis();
  if (!redis) {
    if (!memory.__twoFlocksGame) {
      memory.__twoFlocksGame = emptyState();
    }
    return structuredClone(memory.__twoFlocksGame);
  }

  const stored = await redis.get<GameState>(GAME_KEY);
  if (!stored) {
    return emptyState();
  }
  // Ensure newer fields exist if an older payload is stored
  return {
    ...emptyState(),
    ...stored,
    deckConfig: stored.deckConfig ?? { excluded: [], replacements: [] },
    players: stored.players ?? [],
    deck: stored.deck ?? [],
    version: stored.version ?? 0,
  };
}

export async function saveGame(state: GameState): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    memory.__twoFlocksGame = structuredClone(state);
    return;
  }
  await redis.set(GAME_KEY, state);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

/** Serialize mutations so concurrent joins don't clobber each other. */
export async function withGameLock<T>(
  fn: (state: GameState) => T | Promise<T>,
): Promise<T> {
  const redis = getRedis();

  if (!redis) {
    if (!memory.__twoFlocksGame) {
      memory.__twoFlocksGame = emptyState();
    }
    const result = await fn(memory.__twoFlocksGame);
    return result;
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const acquired = await redis.set(LOCK_KEY, String(Date.now()), {
      nx: true,
      ex: 8,
    });
    // Upstash returns "OK" when the lock is acquired, null otherwise
    if (acquired) {
      try {
        const state = await loadGame();
        const result = await fn(state);
        state.version = (state.version ?? 0) + 1;
        await saveGame(state);
        return result;
      } finally {
        await redis.del(LOCK_KEY);
      }
    }
    await sleep(40 + Math.random() * 80);
  }

  throw new Error("Game is busy — try again in a moment");
}

export { emptyState };
