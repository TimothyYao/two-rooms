"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "two-flocks-player";

type PresentedRole = {
  roleId: string;
  name: string;
  summary: string;
  instructions: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  teamColorMuted: string;
  canonicalName: string;
  primary: boolean;
};

type DeckCount = {
  roleId: string;
  count: number;
  name: string;
  teamName: string;
  teamColor: string;
  canonicalName: string;
};

type RulesSection = { id: string; title: string; body: string[] };

type GamePayload = {
  phase: "lobby" | "in_progress";
  playerCount: number;
  players: { id: string; name: string; isAdmin: boolean }[];
  deckCounts: DeckCount[];
  deckConfig: { excluded: string[]; replacements: string[] };
  dealGeneration: number;
  you?: { id: string; name: string; isAdmin: boolean; roleId?: string };
  yourRole: PresentedRole | null;
  hostageHint: {
    rounds: { name: string; minutes: number }[];
    hostages: readonly number[];
    label: string;
  };
  alternateRoles?: PresentedRole[];
  rules: RulesSection[];
  error?: string;
};

type Tab = "play" | "rules" | "admin";

function readStoredPlayer(): { playerId: string | null; name: string | null } {
  if (typeof window === "undefined") return { playerId: null, name: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { playerId: null, name: null };
    const parsed = JSON.parse(raw) as { playerId?: string; name?: string };
    return {
      playerId: parsed.playerId ?? null,
      name: parsed.name ?? null,
    };
  } catch {
    return { playerId: null, name: null };
  }
}

export default function Home() {
  const [name, setName] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(
    () => readStoredPlayer().playerId,
  );
  const [playerName, setPlayerName] = useState<string | null>(
    () => readStoredPlayer().name,
  );
  const [game, setGame] = useState<GamePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("play");
  const [roleHidden, setRoleHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [replacements, setReplacements] = useState<string[]>([]);
  const [pickAlternateFor, setPickAlternateFor] = useState<string | null>(null);

  const applyPayload = useCallback((data: GamePayload & { playerId?: string }) => {
    setGame(data);
    if (data.deckConfig) {
      setExcluded(data.deckConfig.excluded);
      setReplacements(data.deckConfig.replacements);
    }
    if (data.playerId) {
      setPlayerId(data.playerId);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ playerId: data.playerId, name: data.you?.name }),
      );
    }
    if (data.you?.name) setPlayerName(data.you.name);
  }, []);

  useEffect(() => {
    if (!playerId) return;
    let cancelled = false;
    const tick = async () => {
      const res = await fetch(`/api/game?playerId=${encodeURIComponent(playerId)}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "Could not load game");
        return;
      }
      if (!data.you) {
        localStorage.removeItem(STORAGE_KEY);
        setPlayerId(null);
        setPlayerName(null);
        setGame(null);
        return;
      }
      applyPayload(data);
    };
    const t = setInterval(() => void tick(), 2500);
    queueMicrotask(() => void tick());
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [playerId, applyPayload]);


  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Join failed");
      applyPayload(data);
      setPlayerId(data.playerId);
      setPlayerName(data.you?.name ?? name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Join failed");
    } finally {
      setBusy(false);
    }
  }

  async function adminAction(
    action: string,
    extra: Record<string, unknown> = {},
  ) {
    if (!playerName || !playerId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/game/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminName: playerName,
          playerId,
          ...extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      applyPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveDeck(nextExcluded: string[], nextReplacements: string[]) {
    setExcluded(nextExcluded);
    setReplacements(nextReplacements);
    await adminAction("deck", {
      excluded: nextExcluded,
      replacements: nextReplacements,
    });
  }

  const isAdmin = game?.you?.isAdmin ?? false;

  if (!playerId || !game) {
    return (
      <main className="relative flex flex-1 flex-col px-5 pb-10 pt-12">
        <Atmosphere />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <p className="font-display text-sm tracking-[0.2em] text-[var(--wool)] uppercase">
            Party roles
          </p>
          <h1 className="font-display mt-3 text-5xl leading-[0.95] text-[var(--ink)]">
            Two Flocks
          </h1>
          <p className="mt-4 max-w-[20rem] text-base leading-relaxed text-[var(--ink-soft)]">
            Secret roles for Two Rooms and a Boom — sheep, wolves, and one very
            nervous lamb.
          </p>
          <form onSubmit={handleJoin} className="mt-10 flex flex-col gap-3">
            <label className="text-sm font-medium text-[var(--ink)]" htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              autoComplete="given-name"
              className="min-h-12 rounded-xl border border-[var(--line)] bg-white/80 px-4 text-lg text-[var(--ink)] outline-none ring-[var(--meadow)] focus:ring-2"
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="min-h-12 rounded-xl bg-[var(--meadow)] px-4 text-lg font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? "Joining…" : "Join the flock"}
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-[var(--wolf)]">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <Atmosphere />
      <header className="relative z-10 border-b border-[var(--line)] bg-[var(--cream)]/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="mx-auto flex max-w-lg items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-[var(--ink)]">Two Flocks</h1>
            <p className="text-sm text-[var(--ink-soft)]">
              {playerName}
              {isAdmin ? " · host" : ""} · {game.playerCount} players
              {game.phase === "in_progress" ? " · live" : " · lobby"}
            </p>
          </div>
        </div>
        <nav className="mx-auto mt-3 flex max-w-lg gap-1 rounded-xl bg-[var(--soil)]/10 p-1">
          {(
            [
              ["play", "Play"],
              ["rules", "Rules"],
              ...(isAdmin ? [["admin", "Host"]] : []),
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`min-h-10 flex-1 rounded-lg text-sm font-semibold transition ${
                tab === id
                  ? "bg-white text-[var(--ink)] shadow-sm"
                  : "text-[var(--ink-soft)]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 py-5 pb-24">
        {error && (
          <p className="mb-4 rounded-xl bg-[var(--wolf-soft)] px-3 py-2 text-sm text-[var(--wolf)]">
            {error}
          </p>
        )}

        {tab === "play" && (
          <PlayTab
            game={game}
            roleHidden={roleHidden}
            onToggleHide={() => setRoleHidden((v) => !v)}
          />
        )}
        {tab === "rules" && <RulesTab game={game} />}
        {tab === "admin" && isAdmin && (
          <AdminTab
            game={game}
            busy={busy}
            excluded={excluded}
            replacements={replacements}
            pickAlternateFor={pickAlternateFor}
            setPickAlternateFor={setPickAlternateFor}
            onStart={() => adminAction("start")}
            onRedeal={() => adminAction("redeal")}
            onLobby={() => adminAction("lobby")}
            onReset={() => adminAction("reset")}
            onExclude={async (roleId) => {
              const next = excluded.includes(roleId)
                ? excluded.filter((x) => x !== roleId)
                : [...excluded, roleId];
              // Removing exclusion clears related replacement prompts
              await saveDeck(next, replacements);
              if (!excluded.includes(roleId)) setPickAlternateFor(roleId);
              else setPickAlternateFor(null);
            }}
            onPickAlternate={async (altId) => {
              const nextReps = altId
                ? [...replacements.filter((r) => r !== altId), altId]
                : replacements;
              await saveDeck(excluded, nextReps);
              setPickAlternateFor(null);
            }}
            onMinimalAlternate={async () => {
              // Default to minimal fillers — just keep exclusion, no specialty replacement
              await saveDeck(excluded, replacements);
              setPickAlternateFor(null);
            }}
            onKick={(id) => adminAction("kick", { kickPlayerId: id })}
          />
        )}
      </div>
    </main>
  );
}

function Atmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-0"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 10% -10%, #c8e0c0 0%, transparent 50%), radial-gradient(ellipse 90% 70% at 100% 0%, #e8d5c4 0%, transparent 45%), radial-gradient(ellipse 80% 50% at 50% 100%, #b7c9c4 0%, transparent 40%), linear-gradient(165deg, #eef3e8 0%, #f4ebe1 48%, #e7eef0 100%)",
      }}
    />
  );
}

function PlayTab({
  game,
  roleHidden,
  onToggleHide,
}: {
  game: GamePayload;
  roleHidden: boolean;
  onToggleHide: () => void;
}) {
  const role = game.yourRole;

  if (game.phase === "lobby") {
    return (
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="font-display text-3xl text-[var(--ink)]">Lobby</h2>
          <p className="mt-1 text-[var(--ink-soft)]">
            Waiting for Tim to deal roles. Split into two rooms once the game
            starts.
          </p>
        </div>
        <ul className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white/70">
          {game.players.map((p) => (
            <li
              key={p.id}
              className="flex min-h-12 items-center justify-between px-4 text-base"
            >
              <span className="text-[var(--ink)]">{p.name}</span>
              {p.isAdmin && (
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--meadow)]">
                  Host
                </span>
              )}
            </li>
          ))}
        </ul>
        {game.playerCount > 0 && (
          <p className="text-sm text-[var(--ink-soft)]">
            Hostage guide for {game.hostageHint.label}:{" "}
            {game.hostageHint.hostages.join(" → ")} per round.
          </p>
        )}
      </section>
    );
  }

  if (!role) {
    return (
      <p className="text-[var(--ink-soft)]">
        Role not assigned yet — pull to refresh or wait a moment.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-3xl text-[var(--ink)]">Your role</h2>
        <button
          type="button"
          onClick={onToggleHide}
          className="min-h-10 rounded-lg border border-[var(--line)] bg-white/80 px-3 text-sm font-semibold text-[var(--ink)]"
        >
          {roleHidden ? "Show" : "Hide"}
        </button>
      </div>

      {roleHidden ? (
        <div className="flex min-h-48 items-center justify-center rounded-3xl border border-dashed border-[var(--line)] bg-white/50">
          <p className="text-[var(--ink-soft)]">Role hidden</p>
        </div>
      ) : (
        <article
          className="overflow-hidden rounded-3xl border border-[var(--line)] shadow-sm"
          style={{ background: role.teamColorMuted }}
        >
          <div
            className="px-5 py-4 text-white"
            style={{ background: role.teamColor }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-90">
              {role.teamName}
            </p>
            <h3 className="font-display mt-1 text-3xl">{role.name}</h3>
          </div>
          <div className="space-y-4 px-5 py-5 text-[var(--ink)]">
            <p className="text-base leading-relaxed">{role.summary}</p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                What to do
              </p>
              <p className="mt-1 text-base leading-relaxed">{role.instructions}</p>
            </div>
          </div>
        </article>
      )}

      <p className="text-sm text-[var(--ink-soft)]">
        Three rounds (3 → 2 → 1 min). Leaders send hostages each round. Open
        Rules for the full guide.
      </p>
    </section>
  );
}

function RulesTab({ game }: { game: GamePayload }) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-3xl text-[var(--ink)]">How to play</h2>
        <p className="mt-1 text-[var(--ink-soft)]">
          Based on Two Rooms and a Boom. Theme names differ; the structure is the
          same.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
          Tonight · {game.hostageHint.label}
        </p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--ink)]">
          {game.hostageHint.rounds.map((r, i) => (
            <li key={r.name}>
              {r.name} ({r.minutes} min): {game.hostageHint.hostages[i]} hostage
              {game.hostageHint.hostages[i] === 1 ? "" : "s"} each room
            </li>
          ))}
        </ul>
      </div>

      {game.rules.map((section) => (
        <article key={section.id}>
          <h3 className="font-display text-xl text-[var(--ink)]">{section.title}</h3>
          <ul className="mt-2 space-y-2 text-base leading-relaxed text-[var(--ink-soft)]">
            {section.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}

function AdminTab({
  game,
  busy,
  excluded,
  replacements,
  pickAlternateFor,
  setPickAlternateFor,
  onStart,
  onRedeal,
  onLobby,
  onReset,
  onExclude,
  onPickAlternate,
  onMinimalAlternate,
  onKick,
}: {
  game: GamePayload;
  busy: boolean;
  excluded: string[];
  replacements: string[];
  pickAlternateFor: string | null;
  setPickAlternateFor: (id: string | null) => void;
  onStart: () => void;
  onRedeal: () => void;
  onLobby: () => void;
  onReset: () => void;
  onExclude: (roleId: string) => void;
  onPickAlternate: (roleId: string | null) => void;
  onMinimalAlternate: () => void;
  onKick: (playerId: string) => void;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-3xl text-[var(--ink)]">Host</h2>
        <p className="mt-1 text-[var(--ink-soft)]">
          You see role counts only — never who has which role. You also get a
          role when the game starts.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy || game.playerCount < 6}
          onClick={onStart}
          className="col-span-2 min-h-12 rounded-xl bg-[var(--meadow)] text-base font-semibold text-white disabled:opacity-50"
        >
          {game.phase === "in_progress" ? "Deal again (same as redeal)" : "Start & deal roles"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onRedeal}
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white/80 text-sm font-semibold text-[var(--ink)]"
        >
          Redeal
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onLobby}
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white/80 text-sm font-semibold text-[var(--ink)]"
        >
          Back to lobby
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onReset}
          className="col-span-2 min-h-11 rounded-xl text-sm font-semibold text-[var(--wolf)]"
        >
          Reset entire game
        </button>
      </div>

      {game.playerCount < 6 && (
        <p className="text-sm text-[var(--ink-soft)]">
          Need at least 6 players to start (official minimum).
        </p>
      )}

      <div>
        <h3 className="font-display text-xl text-[var(--ink)]">Deck census</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Auto-built for {game.playerCount} players using Two Rooms guidelines.
          Tap a role to exclude it, then pick an alternate or keep minimal Sheep/Wolf
          fillers.
        </p>
        <ul className="mt-3 space-y-2">
          {game.deckCounts.map((c) => {
            const isExcluded = excluded.includes(c.roleId);
            const isPrimary =
              c.roleId === "president" || c.roleId === "bomber";
            return (
              <li key={c.roleId}>
                <button
                  type="button"
                  disabled={busy || isPrimary}
                  onClick={() => onExclude(c.roleId)}
                  className={`flex w-full min-h-12 items-center justify-between rounded-xl border px-3 text-left ${
                    isExcluded
                      ? "border-dashed border-[var(--wolf)] bg-[var(--wolf-soft)] opacity-70"
                      : "border-[var(--line)] bg-white/75"
                  } ${isPrimary ? "opacity-90" : ""}`}
                >
                  <span>
                    <span className="font-semibold text-[var(--ink)]">{c.name}</span>
                    <span className="mt-0.5 block text-xs text-[var(--ink-soft)]">
                      {c.teamName}
                      {isPrimary ? " · required" : ""}
                      {isExcluded ? " · excluded" : ""}
                    </span>
                  </span>
                  <span
                    className="rounded-lg px-2 py-1 text-sm font-bold text-white"
                    style={{ background: c.teamColor }}
                  >
                    ×{c.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {pickAlternateFor && (
        <div className="rounded-2xl border border-[var(--line)] bg-white/90 p-4">
          <p className="font-semibold text-[var(--ink)]">
            Excluded a role — pick an alternate?
          </p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Or use minimal Sheep/Wolf fillers (default).
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              className="min-h-11 rounded-xl bg-[var(--meadow)] font-semibold text-white"
              onClick={onMinimalAlternate}
            >
              Use minimal fillers
            </button>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--line)]">
              {(game.alternateRoles ?? [])
                .filter((r) => r.roleId !== pickAlternateFor)
                .map((r) => (
                  <button
                    key={r.roleId}
                    type="button"
                    className="flex w-full min-h-11 items-center justify-between border-b border-[var(--line)] px-3 text-left text-sm last:border-0"
                    onClick={() => onPickAlternate(r.roleId)}
                  >
                    <span>{r.name}</span>
                    <span className="text-[var(--ink-soft)]">{r.teamName}</span>
                  </button>
                ))}
            </div>
            <button
              type="button"
              className="min-h-10 text-sm text-[var(--ink-soft)]"
              onClick={() => setPickAlternateFor(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {replacements.length > 0 && (
        <p className="text-sm text-[var(--ink-soft)]">
          Alternates queued: {replacements.join(", ")}
        </p>
      )}

      <div>
        <h3 className="font-display text-xl text-[var(--ink)]">Players</h3>
        <ul className="mt-2 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white/70">
          {game.players.map((p) => (
            <li
              key={p.id}
              className="flex min-h-12 items-center justify-between gap-2 px-3"
            >
              <span>{p.name}</span>
              {!p.isAdmin && (
                <button
                  type="button"
                  className="text-sm font-semibold text-[var(--wolf)]"
                  onClick={() => onKick(p.id)}
                >
                  Kick
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
