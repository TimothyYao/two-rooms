import { NextResponse } from "next/server";
import { presentDeckCounts, presentRole, hostageHint } from "@/lib/game/present";
import { getGame, publicSnapshot } from "@/lib/game/store";
import { alternateRoleChoices } from "@/lib/roles";
import { RULES_SECTIONS } from "@/lib/rules/content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId") ?? undefined;
  const state = await getGame();
  const snap = publicSnapshot(state, playerId);

  return NextResponse.json({
    ...snap,
    deckCounts: presentDeckCounts(snap.deckCounts),
    yourRole: snap.you?.roleId ? presentRole(snap.you.roleId) : null,
    hostageHint: hostageHint(snap.playerCount || 11),
    alternateRoles: alternateRoleChoices().map((id) => presentRole(id)),
    rules: RULES_SECTIONS,
  });
}
