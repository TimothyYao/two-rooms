import { NextResponse } from "next/server";
import { presentDeckCounts, presentRole, hostageHint } from "@/lib/game/present";
import {
  redeal,
  removePlayer,
  resetGame,
  returnToLobby,
  startGame,
  updateDeckConfig,
  publicSnapshot,
  getGame,
} from "@/lib/game/store";
import type { RoleId } from "@/lib/roles";
import { alternateRoleChoices } from "@/lib/roles";
import { RULES_SECTIONS } from "@/lib/rules/content";

export const dynamic = "force-dynamic";

type ActionBody = {
  action: "start" | "redeal" | "lobby" | "reset" | "deck" | "kick";
  adminName: string;
  playerId?: string;
  excluded?: RoleId[];
  replacements?: RoleId[];
  kickPlayerId?: string;
};

async function payload(playerId?: string) {
  const state = await getGame();
  const snap = publicSnapshot(state, playerId);
  return {
    ...snap,
    deckCounts: presentDeckCounts(snap.deckCounts),
    yourRole: snap.you?.roleId ? presentRole(snap.you.roleId) : null,
    hostageHint: hostageHint(snap.playerCount || 11),
    alternateRoles: alternateRoleChoices().map((id) => presentRole(id)),
    rules: RULES_SECTIONS,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActionBody;
    const { action, adminName, playerId } = body;

    switch (action) {
      case "start":
        await startGame(adminName);
        break;
      case "redeal":
        await redeal(adminName);
        break;
      case "lobby":
        await returnToLobby(adminName);
        break;
      case "reset":
        await resetGame();
        break;
      case "deck":
        await updateDeckConfig(adminName, {
          excluded: body.excluded,
          replacements: body.replacements,
        });
        break;
      case "kick":
        if (!body.kickPlayerId) throw new Error("kickPlayerId required");
        await removePlayer(adminName, body.kickPlayerId);
        break;
      default:
        throw new Error("Unknown action");
    }

    return NextResponse.json(await payload(playerId));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Action failed" },
      { status: 400 },
    );
  }
}
