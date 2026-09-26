import type { RoleId } from "@/lib/roles";

export type GamePhase = "lobby" | "in_progress";

export type Player = {
  id: string;
  name: string;
  joinedAt: number;
  /** Assigned only after start / redeal / late auto-assign. */
  roleId?: RoleId;
};

export type DeckConfig = {
  excluded: RoleId[];
  replacements: RoleId[];
};

export type GameState = {
  phase: GamePhase;
  players: Player[];
  deckConfig: DeckConfig;
  /** Proposed or last-dealt deck composition (role IDs, not assignments). */
  deck: RoleId[];
  startedAt?: number;
  dealGeneration: number;
};

export const ADMIN_NAME = "Tim";

export function isAdminName(name: string): boolean {
  return name.trim() === ADMIN_NAME;
}
