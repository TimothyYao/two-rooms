import type { RoleId, RoleThemeEntry, TeamId, TeamTheme } from "./types";

/**
 * Flock theme copy. Rename freely here — keep RoleIds stable in catalog.ts.
 * Swap this module (or load from JSON/CMS later) to retheme the whole app.
 */
export const TEAM_THEME: Record<TeamId, TeamTheme> = {
  blue: {
    name: "Sheep",
    adjective: "Sheep",
    color: "#2f6b4f",
    colorMuted: "#d7ebe0",
  },
  red: {
    name: "Wolves",
    adjective: "Wolf",
    color: "#8b3a2a",
    colorMuted: "#f0d9d2",
  },
  grey: {
    name: "Wanderers",
    adjective: "Wanderer",
    color: "#5c5a66",
    colorMuted: "#e6e4ea",
  },
};

export const ROLE_THEME: Record<RoleId, RoleThemeEntry> = {
  president: {
    name: "The Lamb",
    summary: "You are the prize. Sheep win if you are NOT in the same room as The Wolf after the final swap.",
    instructions:
      "Stay quiet about your identity unless you trust someone. Find Sheep allies. Avoid ending with The Wolf. You may show your card, your flock color only (11+ players), or nothing.",
  },
  bomber: {
    name: "The Wolf",
    summary: "You are the hunter. Wolves win if you ARE in the same room as The Lamb after the final swap.",
    instructions:
      "Find Wolf allies and track The Lamb. Try to be swapped into (or stay in) The Lamb’s room by the end. You may show your card, color only (11+), or nothing.",
  },
  blue_team: {
    name: "Sheep",
    summary: "You are on the Sheep flock. Win if The Lamb is not with The Wolf at the end.",
    instructions:
      "Identify fellow Sheep, protect The Lamb, and influence your room’s leader so the wrong people get swapped.",
  },
  red_team: {
    name: "Wolf",
    summary: "You are on the Wolf pack. Win if The Wolf is with The Lamb at the end.",
    instructions:
      "Identify fellow Wolves, locate The Lamb, and push hostage swaps that reunite The Wolf with The Lamb.",
  },
  gambler: {
    name: "Fortune Teller",
    summary: "Before the final reveal, publicly guess which flock won. You win if you are right.",
    instructions:
      "Listen carefully. At the end—before cards are revealed—announce Sheep or Wolves. Room does not matter for you.",
  },
  mi6: {
    name: "Village Watch",
    summary: "You win if you privately learn both The Lamb’s and The Wolf’s identities (card share) before the end.",
    instructions:
      "Card-share with players until you have seen both key roles. Do not announce your goal loudly or both flocks will stonewall you.",
  },
  doctor: {
    name: "Shepherd",
    summary: "Sheep win only if The Lamb avoids The Wolf AND you card-share with The Lamb before the end.",
    instructions:
      "You must card-share with The Lamb. Convince them you are the Shepherd—impostors may claim this too.",
  },
  engineer: {
    name: "Alpha",
    summary: "Wolves win only if The Wolf is with The Lamb AND you card-share with The Wolf before the end.",
    instructions:
      "You must card-share with The Wolf. Help the pack while securing your own link to The Wolf.",
  },
  coy_blue: {
    name: "Shy Sheep",
    summary: "Sheep flock. You cannot card-share or color-share.",
    instructions:
      "Refuse all shares. You can still talk, accuse, and vote for leaders. Your silence is part of your cover.",
  },
  coy_red: {
    name: "Shy Wolf",
    summary: "Wolf pack. You cannot card-share or color-share.",
    instructions:
      "Refuse all shares. Bluff, vote, and steer hostages without ever proving your color.",
  },
  spy_blue: {
    name: "Infiltrator Sheep",
    summary: "Sheep flock. You appear as a Wolf if you color-share; card-share still shows the truth.",
    instructions:
      "Use fake Wolf color-shares to infiltrate. Full card-share reveals you are Sheep—use that carefully.",
  },
  spy_red: {
    name: "Infiltrator Wolf",
    summary: "Wolf pack. You appear as a Sheep if you color-share; card-share still shows the truth.",
    instructions:
      "Color-share as Sheep to gain trust. Avoid card-shares that expose you unless it serves the pack.",
  },
  negotiator_blue: {
    name: "Broker Sheep",
    summary: "Sheep flock. You may walk between rooms; you cannot lead or be a hostage.",
    instructions:
      "Announce that you are a Broker at the start (not your flock). Carry information between rooms. You are not part of a room’s vote count.",
  },
  negotiator_red: {
    name: "Broker Wolf",
    summary: "Wolf pack. You may walk between rooms; you cannot lead or be a hostage.",
    instructions:
      "Announce that you are a Broker at the start (not your flock). Mislead the other room if it helps the Wolves.",
  },
  werewolf_a: {
    name: "Moonbitten",
    summary: "Anyone who card-shares with you is bitten. If you publicly reveal, all bitten players must reveal and howl.",
    instructions:
      "There are two Moonbitten. Spread bites through card-shares. Public reveal forces every bitten player to reveal too.",
  },
  werewolf_b: {
    name: "Moonbitten",
    summary: "Anyone who card-shares with you is bitten. If you publicly reveal, all bitten players must reveal and howl.",
    instructions:
      "There are two Moonbitten. Spread bites through card-shares. Public reveal forces every bitten player to reveal too.",
  },
  survivor: {
    name: "Lucky Sheep",
    summary: "You win if you are NOT in The Wolf’s room at the end.",
    instructions:
      "Track The Wolf and escape that room via hostage swaps. Your win is independent of the flocks.",
  },
  victim: {
    name: "Marked",
    summary: "You win if you ARE in The Wolf’s room at the end.",
    instructions:
      "Find The Wolf and arrange to be in that room for the final boom. Your win is independent of the flocks.",
  },
  intern: {
    name: "Lost Lamb",
    summary: "You win if you are in the same room as The Lamb at the end.",
    instructions:
      "Attach yourself to whoever you believe is The Lamb. Ignore the Wolf fight except as a clue.",
  },
  rival: {
    name: "Black Sheep",
    summary: "You win if you are NOT in the same room as The Lamb at the end.",
    instructions:
      "Keep distance from The Lamb. Survive the politics without ending beside them.",
  },
  angel_blue: {
    name: "Guardian Sheep",
    summary: "Sheep flock. If you card-share with The Lamb, you may keep them from being swapped this round (per Angel rules).",
    instructions:
      "Stay near The Lamb. Use your guardian power when a bad hostage swap would doom them.",
  },
  angel_red: {
    name: "Guardian Wolf",
    summary: "Wolf pack. If you card-share with The Wolf, you may keep them from being swapped this round (per Angel rules).",
    instructions:
      "Protect The Wolf’s position when a swap would separate them from The Lamb.",
  },
  mime_blue: {
    name: "Silent Sheep",
    summary: "Sheep flock. You cannot talk—only gesture.",
    instructions:
      "Communicate without words. Point, nod, refuse shares dramatically. Still vote for leaders with gestures.",
  },
  mime_red: {
    name: "Silent Wolf",
    summary: "Wolf pack. You cannot talk—only gesture.",
    instructions:
      "Communicate without words. Your silence can be a powerful bluff—or a giveaway.",
  },
  paparazzo_blue: {
    name: "Gossip Sheep",
    summary: "Sheep flock. You must publicly announce every card-share or color-share you witness or perform (keep it loud).",
    instructions:
      "Be the room’s loudmouth about shares. Information chaos helps Sheep if you steer it well.",
  },
  paparazzo_red: {
    name: "Gossip Wolf",
    summary: "Wolf pack. You must publicly announce every card-share or color-share you witness or perform (keep it loud).",
    instructions:
      "Force transparency that exposes Sheep plans—or bury the room in noise.",
  },
};

export function getRoleTheme(id: RoleId): RoleThemeEntry {
  return ROLE_THEME[id];
}

export function getTeamTheme(team: TeamId): TeamTheme {
  return TEAM_THEME[team];
}
