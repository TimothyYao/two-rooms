import { buildDefaultDeck, shuffle, type RoleId } from "@/lib/roles";
import { loadGame, saveGame, usingPersistentStore, withGameLock } from "./db";
import {
  ADMIN_NAME,
  isAdminName,
  type DeckConfig,
  type GameState,
  type Player,
} from "./types";

export { usingPersistentStore };

function rebuildDeck(state: GameState): void {
  state.deck = buildDefaultDeck({
    playerCount: Math.max(state.players.length, 0),
    excluded: state.deckConfig.excluded,
    replacements: state.deckConfig.replacements,
  });
}

export async function getGame(): Promise<GameState> {
  return loadGame();
}

export async function resetGame(): Promise<GameState> {
  return withGameLock(async (state) => {
    state.phase = "lobby";
    state.players = [];
    state.deckConfig = { excluded: [], replacements: [] };
    state.deck = [];
    state.dealGeneration = 0;
    delete state.startedAt;
    return state;
  });
}

export async function joinGame(
  name: string,
): Promise<{ player: Player; state: GameState }> {
  return withGameLock(async (state) => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Name is required");
    }
    if (trimmed.length > 24) {
      throw new Error("Name is too long");
    }

    const existing = state.players.find(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) {
      return { player: existing, state };
    }

    if (
      isAdminName(trimmed) &&
      state.players.some((p) => isAdminName(p.name))
    ) {
      throw new Error("Tim is already in the game");
    }

    const player: Player = {
      id: crypto.randomUUID(),
      name: trimmed,
      joinedAt: Date.now(),
    };

    state.players.push(player);
    rebuildDeck(state);

    if (state.phase === "in_progress") {
      autoAssignRole(state, player);
    }

    return { player, state };
  });
}

function autoAssignRole(state: GameState, player: Player): void {
  const used = new Map<RoleId, number>();
  for (const p of state.players) {
    if (!p.roleId) continue;
    used.set(p.roleId, (used.get(p.roleId) ?? 0) + 1);
  }

  const needed = new Map<RoleId, number>();
  for (const id of state.deck) {
    needed.set(id, (needed.get(id) ?? 0) + 1);
  }

  for (const id of state.deck) {
    const have = used.get(id) ?? 0;
    const want = needed.get(id) ?? 0;
    if (have < want) {
      player.roleId = id;
      used.set(id, have + 1);
      return;
    }
  }

  const assigned = state.players.filter((p) => p.roleId).length;
  const nextFiller: RoleId = assigned % 2 === 0 ? "blue_team" : "red_team";
  state.deck.push(nextFiller);
  player.roleId = nextFiller;
}

function dealAll(state: GameState): void {
  rebuildDeck(state);
  const roles = shuffle([...state.deck]);
  state.players.forEach((p, i) => {
    p.roleId = roles[i];
  });
  state.dealGeneration += 1;
  state.phase = "in_progress";
  state.startedAt = Date.now();
}

export async function startGame(requesterName: string): Promise<GameState> {
  return withGameLock(async (state) => {
    assertAdmin(requesterName);
    if (state.players.length < 6) {
      throw new Error("Need at least 6 players (Two Rooms and a Boom minimum)");
    }
    dealAll(state);
    return state;
  });
}

export async function redeal(requesterName: string): Promise<GameState> {
  return withGameLock(async (state) => {
    assertAdmin(requesterName);
    if (state.players.length < 1) {
      throw new Error("No players to deal");
    }
    dealAll(state);
    return state;
  });
}

export async function returnToLobby(requesterName: string): Promise<GameState> {
  return withGameLock(async (state) => {
    assertAdmin(requesterName);
    state.phase = "lobby";
    state.startedAt = undefined;
    for (const p of state.players) {
      delete p.roleId;
    }
    rebuildDeck(state);
    return state;
  });
}

export async function updateDeckConfig(
  requesterName: string,
  config: Partial<DeckConfig>,
): Promise<GameState> {
  return withGameLock(async (state) => {
    assertAdmin(requesterName);
    if (config.excluded) state.deckConfig.excluded = config.excluded;
    if (config.replacements) state.deckConfig.replacements = config.replacements;
    rebuildDeck(state);
    return state;
  });
}

export async function removePlayer(
  requesterName: string,
  playerId: string,
): Promise<GameState> {
  return withGameLock(async (state) => {
    assertAdmin(requesterName);
    state.players = state.players.filter((p) => p.id !== playerId);
    rebuildDeck(state);
    return state;
  });
}

function assertAdmin(name: string) {
  if (!isAdminName(name)) {
    throw new Error(`Only ${ADMIN_NAME} can do that`);
  }
}

/** Public view: never includes other players' roles. */
export function publicSnapshot(
  state: GameState,
  viewerId?: string,
): {
  phase: GameState["phase"];
  playerCount: number;
  players: { id: string; name: string; isAdmin: boolean }[];
  deckCounts: { roleId: RoleId; count: number }[];
  deckConfig: DeckConfig;
  dealGeneration: number;
  persistent: boolean;
  you?: {
    id: string;
    name: string;
    isAdmin: boolean;
    roleId?: RoleId;
  };
} {
  const deckCountsMap = new Map<RoleId, number>();
  for (const id of state.deck) {
    deckCountsMap.set(id, (deckCountsMap.get(id) ?? 0) + 1);
  }

  const viewer = viewerId
    ? state.players.find((p) => p.id === viewerId)
    : undefined;

  return {
    phase: state.phase,
    playerCount: state.players.length,
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      isAdmin: isAdminName(p.name),
    })),
    deckCounts: [...deckCountsMap.entries()].map(([roleId, count]) => ({
      roleId,
      count,
    })),
    deckConfig: state.deckConfig,
    dealGeneration: state.dealGeneration,
    persistent: usingPersistentStore(),
    you: viewer
      ? {
          id: viewer.id,
          name: viewer.name,
          isAdmin: isAdminName(viewer.name),
          roleId: viewer.roleId,
        }
      : undefined,
  };
}

// Re-export for rare direct saves (tests)
export { saveGame, loadGame };
