import { NextResponse } from "next/server";
import { presentDeckCounts, presentRole, hostageHint } from "@/lib/game/present";
import { joinGame, publicSnapshot } from "@/lib/game/store";
import { RULES_SECTIONS } from "@/lib/rules/content";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const { player, state } = joinGame(body.name ?? "");
    const snap = publicSnapshot(state, player.id);
    return NextResponse.json({
      playerId: player.id,
      ...snap,
      deckCounts: presentDeckCounts(snap.deckCounts),
      yourRole: snap.you?.roleId ? presentRole(snap.you.roleId) : null,
      hostageHint: hostageHint(snap.playerCount || 11),
      rules: RULES_SECTIONS,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Join failed" },
      { status: 400 },
    );
  }
}
