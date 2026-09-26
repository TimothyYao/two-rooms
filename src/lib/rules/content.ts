/** Rules copy for the Rules tab — themed, mechanics match Two Rooms and a Boom. */

export const ROUND_PLAN = [
  { name: "Round 1", minutes: 3 },
  { name: "Round 2", minutes: 2 },
  { name: "Round 3", minutes: 1 },
] as const;

export const HOSTAGE_CHART = [
  { min: 6, max: 10, label: "6–10 players", hostages: [1, 1, 1] },
  { min: 11, max: 21, label: "11–21 players", hostages: [2, 1, 1] },
  { min: 22, max: 99, label: "22+ players", hostages: [3, 2, 1] },
] as const;

export const RULES_SECTIONS = [
  {
    id: "goal",
    title: "How to win",
    body: [
      "Players split into two physical rooms. Each person has a secret role.",
      "Sheep win if The Lamb is NOT in the same room as The Wolf after the final hostage swap.",
      "Wolves win if The Wolf IS in the same room as The Lamb after the final swap.",
      "Wanderers have their own win conditions (read your role card).",
    ],
  },
  {
    id: "setup",
    title: "Setup",
    body: [
      "Everyone joins on their phone and receives a role when Tim starts the game.",
      "Split into two rooms as evenly as you can. Rooms should not overhear each other.",
      "Do not show your role until play begins (unless a role says otherwise).",
    ],
  },
  {
    id: "rounds",
    title: "Three rounds",
    body: [
      "Play three timed rounds: 3 minutes, then 2 minutes, then 1 minute. Time them yourselves.",
      "After each round, each room’s leader sends hostages to the other room.",
      "After the last swap, gather carefully (stay in your two groups) and reveal roles.",
    ],
  },
  {
    id: "leaders",
    title: "Leaders & hostages",
    body: [
      "In each room, the first person nominated becomes the leader.",
      "Anyone can try to take over: raise one hand and point at your choice. If more than half the room points at one person, they become leader.",
      "A leader may hand leadership to someone else who accepts (no immediate take-backs).",
      "Leaders choose who swaps rooms. Leaders cannot be hostages.",
      "Announce hostages only to your own room, then leaders meet in the middle before the swap so neither side reacts to the other’s picks.",
    ],
  },
  {
    id: "hostages",
    title: "Hostage counts",
    body: [
      "6–10 players: 1 hostage each round.",
      "11–21 players: 2 hostages in round 1, then 1, then 1.",
      "22+ players: 3 hostages, then 2, then 1.",
    ],
  },
  {
    id: "during",
    title: "During a round",
    body: [
      "Stay in your room. No talking or signaling between rooms.",
      "You may not trade roles with anyone.",
      "You may show your full card, show only your flock color (recommended with 11+ players), or show nothing. Lying is allowed.",
      "Card share = privately show full roles to each other. Color share = show only flock color.",
    ],
  },
  {
    id: "end",
    title: "Final reveal",
    body: [
      "After the last hostage swap, reveal roles.",
      "If The Fortune Teller is in play, they guess the winning flock before the reveal.",
      "The Wolf’s boom hits everyone in The Wolf’s room—if The Lamb is there, Wolves win; otherwise Sheep win.",
    ],
  },
] as const;
