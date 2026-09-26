export type { RoleId, TeamId, RoleCatalogEntry, RoleThemeEntry, TeamTheme } from "./types";
export { ROLE_CATALOG, ALL_ROLE_IDS, getRole } from "./catalog";
export { ROLE_THEME, TEAM_THEME, getRoleTheme, getTeamTheme } from "./theme";
export {
  buildDefaultDeck,
  countRoles,
  countByCanonicalGroup,
  shuffle,
  alternateRoleChoices,
  SPECIAL_GROUPS,
} from "./deck";
export type { DeckBuildOptions } from "./deck";
export { ROLE_AVATAR, getAvatarAssets } from "./avatars";
export type { AvatarKey, AvatarAssets } from "./avatars";