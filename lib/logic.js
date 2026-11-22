import { publicProfile } from "./db.js";

export function getFeed(db) {
  return db.profiles.filter((p) => !db.swipes[p.id]).map(publicProfile);
}

// Returns { status, body }; mutates db only when the swipe is valid.
export function applySwipe(db, { profileId, action }, now = new Date()) {
  if (action !== "like" && action !== "pass") {
    return { status: 400, body: { error: "action must be 'like' or 'pass'" } };
  }
  const profile = db.profiles.find((p) => p.id === profileId);
  if (!profile) return { status: 404, body: { error: "profile not found" } };

  // A profile can only be swiped once. Repeats are rejected, not re-evaluated,
  // so nobody can pass -> like to probe whether someone liked them.
  if (db.swipes[profileId]) {
    return { status: 409, body: { error: "already swiped" } };
  }

  const at = now.toISOString();
  db.swipes[profileId] = { action, at };

  // Match only if BOTH sides liked. `likesYou` stays on the server.
  const matched = action === "like" && profile.likesYou === true;
  if (matched) db.matches.push({ profileId, at });

  return {
    status: 200,
    body: { match: matched, profile: matched ? publicProfile(profile) : undefined },
  };
}

export function getMatches(db) {
  return db.matches
    .map((m) => {
      const p = db.profiles.find((x) => x.id === m.profileId);
      return p ? { ...publicProfile(p), matchedAt: m.at } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}
