import type { RoleId } from "./types";

/**
 * Maps mechanical role IDs → files in /public/avatars/{stills,animations}.
 * Pack keys match Muse character-pack filenames (without extension).
 */
export type AvatarKey =
  | "lamb"
  | "wolf"
  | "sheep"
  | "werewolf"
  | "shepherd"
  | "shy-sheep"
  | "infiltrator-sheep"
  | "broker-sheep"
  | "guardian-sheep"
  | "silent-sheep"
  | "gossip-sheep"
  | "lucky-sheep"
  | "lost-lamb"
  | "black-sheep"
  | "alpha"
  | "shy-wolf"
  | "infiltrator-wolf"
  | "broker-wolf"
  | "guardian-wolf"
  | "silent-wolf"
  | "gossip-wolf";

/** Roles without a dedicated pack asset yet fall back (documented below). */
export const ROLE_AVATAR: Record<RoleId, AvatarKey> = {
  president: "lamb",
  bomber: "wolf",
  blue_team: "sheep",
  // Pack has no separate generic pack-wolf; reuse The Wolf art for now
  red_team: "wolf",
  // Missing from pack — temporary wanderer stand-ins until you add assets
  gambler: "black-sheep",
  mi6: "shepherd",
  victim: "werewolf",
  doctor: "shepherd",
  engineer: "alpha",
  coy_blue: "shy-sheep",
  coy_red: "shy-wolf",
  spy_blue: "infiltrator-sheep",
  spy_red: "infiltrator-wolf",
  negotiator_blue: "broker-sheep",
  negotiator_red: "broker-wolf",
  werewolf_a: "werewolf",
  werewolf_b: "werewolf",
  survivor: "lucky-sheep",
  intern: "lost-lamb",
  rival: "black-sheep",
  angel_blue: "guardian-sheep",
  angel_red: "guardian-wolf",
  mime_blue: "silent-sheep",
  mime_red: "silent-wolf",
  paparazzo_blue: "gossip-sheep",
  paparazzo_red: "gossip-wolf",
};

export type AvatarAssets = {
  key: AvatarKey;
  still: string;
  animation: string;
};

export function getAvatarAssets(roleId: RoleId): AvatarAssets {
  const key = ROLE_AVATAR[roleId];
  return {
    key,
    still: `/avatars/stills/${key}.webp`,
    animation: `/avatars/animations/${key}-idle.webm`,
  };
}
