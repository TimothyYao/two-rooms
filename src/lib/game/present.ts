import { getRoleTheme, getTeamTheme, ROLE_CATALOG, type RoleId } from "@/lib/roles";
import { HOSTAGE_CHART, ROUND_PLAN } from "@/lib/rules/content";

export function presentRole(roleId: RoleId) {
  const mech = ROLE_CATALOG[roleId];
  const theme = getRoleTheme(roleId);
  const team = getTeamTheme(mech.team);
  return {
    roleId,
    name: theme.name,
    summary: theme.summary,
    instructions: theme.instructions,
    teamId: mech.team,
    teamName: team.name,
    teamColor: team.color,
    teamColorMuted: team.colorMuted,
    canonicalName: mech.canonicalName,
    primary: mech.primary,
  };
}

export function presentDeckCounts(
  counts: { roleId: RoleId; count: number }[],
) {
  // Aggregate by themed display name so pairs like Moonbitten show as ×2
  const byName = new Map<
    string,
    {
      roleId: RoleId;
      count: number;
      name: string;
      teamName: string;
      teamColor: string;
      canonicalName: string;
    }
  >();

  for (const c of counts) {
    const p = presentRole(c.roleId);
    const key = `${p.name}::${p.teamName}`;
    const existing = byName.get(key);
    if (existing) {
      existing.count += c.count;
    } else {
      byName.set(key, {
        roleId: c.roleId,
        count: c.count,
        name: p.name,
        teamName: p.teamName,
        teamColor: p.teamColor,
        canonicalName: p.canonicalName,
      });
    }
  }

  return [...byName.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.roleId.localeCompare(b.roleId),
  );
}

export function hostageHint(playerCount: number) {
  const row =
    HOSTAGE_CHART.find((r) => playerCount >= r.min && playerCount <= r.max) ??
    HOSTAGE_CHART[HOSTAGE_CHART.length - 1];
  return {
    rounds: ROUND_PLAN,
    hostages: row.hostages,
    label: row.label,
  };
}
