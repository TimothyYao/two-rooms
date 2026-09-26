/** Stable mechanical IDs — never rename these; change display copy in theme.ts */
export type RoleId =
  | "president"
  | "bomber"
  | "blue_team"
  | "red_team"
  | "gambler"
  | "mi6"
  | "doctor"
  | "engineer"
  | "coy_blue"
  | "coy_red"
  | "spy_blue"
  | "spy_red"
  | "negotiator_blue"
  | "negotiator_red"
  | "werewolf_a"
  | "werewolf_b"
  | "survivor"
  | "victim"
  | "intern"
  | "rival"
  | "angel_blue"
  | "angel_red"
  | "mime_blue"
  | "mime_red"
  | "paparazzo_blue"
  | "paparazzo_red";

export type TeamId = "blue" | "red" | "grey";

export type RoleCatalogEntry = {
  id: RoleId;
  /** Mechanical team (blue/red/grey). Display labels come from theme. */
  team: TeamId;
  /** True for President / Bomber — cannot be excluded. */
  primary: boolean;
  /** Generic team filler used when balancing the deck. */
  filler: boolean;
  /** Minimum player count before this role is auto-included. */
  minPlayers: number;
  /** If set, this role is dealt as part of a pair with the other id. */
  pairWith?: RoleId;
  /** Official TRB character name — for rules cross-reference / future rename tools. */
  canonicalName: string;
};

export type RoleThemeEntry = {
  name: string;
  /** Short win / identity line shown on the role card. */
  summary: string;
  /** Basic what-to-do instructions on the role card. */
  instructions: string;
};

export type TeamTheme = {
  name: string;
  adjective: string;
  color: string;
  colorMuted: string;
};
