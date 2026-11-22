// Run with: npm test  (Node 18+)
import test from "node:test";
import assert from "node:assert/strict";
import { buildSeed } from "../lib/seed.js";
import { getFeed, applySwipe, getMatches } from "../lib/logic.js";

const newDb = () => ({ profiles: buildSeed(), swipes: {}, matches: [] });

test("seed has 30+ profiles with required fields and some likers", () => {
  const { profiles } = newDb();
  assert.ok(profiles.length >= 30);
  for (const p of profiles)
    for (const k of ["id", "name", "age", "photo", "bio", "place", "interests"]) assert.ok(p[k], k);
  assert.ok(profiles.some((p) => p.likesYou));
});

test("feed never exposes likesYou", () => {
  const feed = getFeed(newDb());
  assert.ok(feed.length >= 30);
  assert.ok(feed.every((p) => !("likesYou" in p)));
});

test("like on someone who liked you creates a match", () => {
  const db = newDb();
  const liker = db.profiles.find((p) => p.likesYou);
  const r = applySwipe(db, { profileId: liker.id, action: "like" });
  assert.equal(r.status, 200);
  assert.equal(r.body.match, true);
  assert.ok(!("likesYou" in r.body.profile));
  assert.equal(getMatches(db).length, 1);
});

test("like on someone who did not like you is not a match", () => {
  const db = newDb();
  const other = db.profiles.find((p) => !p.likesYou);
  assert.equal(applySwipe(db, { profileId: other.id, action: "like" }).body.match, false);
  assert.equal(getMatches(db).length, 0);
});

test("pass never matches, even on someone who liked you", () => {
  const db = newDb();
  const liker = db.profiles.find((p) => p.likesYou);
  assert.equal(applySwipe(db, { profileId: liker.id, action: "pass" }).body.match, false);
  assert.equal(getMatches(db).length, 0);
});

test("swiped profiles leave the feed and cannot be swiped twice", () => {
  const db = newDb();
  const p = db.profiles[0];
  applySwipe(db, { profileId: p.id, action: "pass" });
  assert.ok(!getFeed(db).some((x) => x.id === p.id));
  assert.equal(applySwipe(db, { profileId: p.id, action: "like" }).status, 409);
});

test("rejects bad input", () => {
  const db = newDb();
  assert.equal(applySwipe(db, { profileId: "nope", action: "like" }).status, 404);
  assert.equal(applySwipe(db, { profileId: db.profiles[0].id, action: "super" }).status, 400);
});

test("empty feed after swiping everyone", () => {
  const db = newDb();
  for (const p of [...db.profiles]) applySwipe(db, { profileId: p.id, action: "pass" });
  assert.equal(getFeed(db).length, 0);
});
