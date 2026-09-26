import assert from "node:assert/strict";
import { buildDefaultDeck } from "../src/lib/roles/deck";

function check(n: number) {
  const deck = buildDefaultDeck({ playerCount: n });
  assert.equal(deck.length, n, `deck length for ${n}`);
  assert.ok(deck.includes("president"));
  assert.ok(deck.includes("bomber"));
  if (n % 2 === 1) {
    assert.ok(
      deck.includes("gambler") || deck.includes("mi6"),
      `odd ${n} needs grey`,
    );
  }
  return deck;
}

assert.ok(!check(10).includes("doctor"), "no doctor under 11");
assert.ok(check(11).includes("doctor"));
assert.ok(check(12).includes("werewolf_a"));
assert.ok(check(16).includes("angel_blue"));
assert.ok(check(18).includes("mime_blue"));
assert.ok(check(20).includes("paparazzo_blue"));

const excluded = buildDefaultDeck({
  playerCount: 11,
  excluded: ["doctor"],
});
assert.ok(!excluded.includes("doctor") && !excluded.includes("engineer"));

console.log("deck tests ok");
