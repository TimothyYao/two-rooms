import { ROLE_CATALOG } from "./catalog";
import type { RoleId } from "./types";

/**
 * Special-role groups added in official TRB tutorial order / player-count gates.
 * @see https://www.tuesdayknightgames.com/pages/two-rooms-and-a-boom-music-playsets
 *
 * - ≤10: basic game only (President, Bomber, team fillers, Gambler if odd)
 * - ≥11: Color Share set (Doctor/Engineer, Coy, Spy, Negotiator)
 * - ≥12: Grey set extras (Werewolves, Survivor, Victim, Intern, Rival; MI6 if odd)
 * - ≥16 / 18 / 20: Angel, Mime, Paparazzo pairs (large-game playset)
 */
const SPECIAL_GROUPS: { minPlayers: number; roles: RoleId[] }[] = [
  // Color-share core (My First Color Share) — from 11
  { minPlayers: 11, roles: ["doctor", "engineer"] },
  { minPlayers: 11, roles: ["coy_blue", "coy_red"] },
  { minPlayers: 11, roles: ["spy_blue", "spy_red"] },
  { minPlayers: 11, roles: ["negotiator_blue", "negotiator_red"] },
  // Werewolves with first greys (My First Grey Game) — from 12
  { minPlayers: 12, roles: ["werewolf_a", "werewolf_b"] },
  // Large-game pairs before leftover greys so gates match official playsets
  { minPlayers: 16, roles: ["angel_blue", "angel_red"] },
  { minPlayers: 18, roles: ["mime_blue", "mime_red"] },
  { minPlayers: 20, roles: ["paparazzo_blue", "paparazzo_red"] },
  // Remaining greys fill leftover seats
  { minPlayers: 12, roles: ["survivor"] },
  { minPlayers: 12, roles: ["victim"] },
  { minPlayers: 12, roles: ["intern"] },
  { minPlayers: 12, roles: ["rival"] },
];

export type DeckBuildOptions = {
  playerCount: number;
  /** Role IDs Tim removed from the default proposal. */
  excluded?: RoleId[];
  /** Replacements Tim chose for excluded roles (or for empty slots). */
  replacements?: RoleId[];
};

function oddGreyForCount(playerCount: number): RoleId {
  return playerCount >= 12 ? "mi6" : "gambler";
}

function expandExclusions(excluded: RoleId[]): Set<RoleId> {
  const set = new Set<RoleId>();
  for (const id of excluded) {
    set.add(id);
    const pair = ROLE_CATALOG[id].pairWith;
    if (pair) set.add(pair);
  }
  return set;
}

/** Count how many free slots remain before we must stop adding specials. */
function canFit(
  currentLen: number,
  adding: number,
  target: number,
  reserveOdd: number,
): boolean {
  return currentLen + adding + reserveOdd <= target;
}

/**
 * Build a balanced deck for N players following TRB sizing guidelines.
 * Always includes President + Bomber. Fills remainder with equal team cards.
 * Odd counts get one grey (Gambler or MI6).
 */
export function buildDefaultDeck(options: DeckBuildOptions): RoleId[] {
  const { playerCount } = options;
  if (playerCount < 1) return [];

  const excluded = expandExclusions(options.excluded ?? []);
  const replacements = [...(options.replacements ?? [])];
  const odd = playerCount % 2 === 1;
  const reserveOdd = odd ? 1 : 0;
  const target = playerCount;

  const deck: RoleId[] = [];

  const tryAdd = (roles: RoleId[]) => {
    const filtered = roles.filter((r) => !excluded.has(r));
    if (filtered.length === 0) return;
    // If a pair was half-excluded, skip the whole pair for balance
    if (roles.length > 1 && filtered.length !== roles.length) return;
    if (!canFit(deck.length, filtered.length, target, reserveOdd)) return;
    deck.push(...filtered);
  };

  tryAdd(["president", "bomber"]);

  for (const group of SPECIAL_GROUPS) {
    if (playerCount < group.minPlayers) continue;
    tryAdd(group.roles);
  }

  // Apply admin replacements into remaining capacity (before fillers / odd grey)
  for (const rep of replacements) {
    if (ROLE_CATALOG[rep].primary) continue;
    if (deck.includes(rep) && !ROLE_CATALOG[rep].filler) continue;
    if (!canFit(deck.length, 1, target, reserveOdd)) break;
    if (odd && ROLE_CATALOG[rep].team === "grey" && reserveOdd) {
      // leave odd slot for dedicated grey below unless this is that grey
      continue;
    }
    deck.push(rep);
  }

  if (odd) {
    const grey = oddGreyForCount(playerCount);
    const greyChoice =
      replacements.find((r) => ROLE_CATALOG[r].team === "grey") ??
      (excluded.has(grey) ? "gambler" : grey);
    if (deck.length < target) {
      deck.push(excluded.has(greyChoice) ? "gambler" : greyChoice);
    }
  }

  // Fill with equal Sheep / Wolf team cards
  let remaining = target - deck.length;
  if (remaining < 0) {
    // Shouldn't happen; trim non-primaries from the end
    while (deck.length > target) {
      const idx = [...deck].map((id, i) => ({ id, i })).reverse()
        .find((x) => !ROLE_CATALOG[x.id].primary);
      if (!idx) break;
      deck.splice(idx.i, 1);
    }
    remaining = target - deck.length;
  }

  const blueFill = Math.ceil(remaining / 2);
  const redFill = Math.floor(remaining / 2);
  for (let i = 0; i < blueFill; i++) deck.push("blue_team");
  for (let i = 0; i < redFill; i++) deck.push("red_team");

  return deck.slice(0, target);
}

export function countRoles(deck: RoleId[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of deck) {
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

/** Aggregate counts by display key — callers map IDs through theme. */
export function countByCanonicalGroup(deck: RoleId[]): { id: RoleId; count: number }[] {
  const counts = countRoles(deck);
  return Object.entries(counts)
    .map(([id, count]) => ({ id: id as RoleId, count }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Roles Tim can pick as alternates when excluding something. */
export function alternateRoleChoices(): RoleId[] {
  return (Object.keys(ROLE_CATALOG) as RoleId[]).filter(
    (id) => !ROLE_CATALOG[id].primary,
  );
}

export { SPECIAL_GROUPS };
