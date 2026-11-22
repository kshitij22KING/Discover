import fs from "fs";
import path from "path";
import { buildSeed } from "./seed.js";

const DB_PATH = process.env.COY_DB_PATH || path.join(process.cwd(), "data", "db.json");

function fresh() {
  // swipes:  { [profileId]: { action: "like" | "pass", at: ISO } }
  // matches: [{ profileId, at: ISO }]
  return { profiles: buildSeed(), swipes: {}, matches: [] };
}

export function load() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    const db = fresh();
    save(db);
    return db;
  }
}

export function save(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  // write to a temp file then rename, so a crash can't leave half-written JSON
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

export function reset() {
  const db = fresh();
  save(db);
  return db;
}

// The only shape of a profile ever sent to the client.
// `likesYou` is deliberately dropped: this is Coy's core privacy promise.
export function publicProfile({ id, name, age, photo, bio, place, interests }) {
  return { id, name, age, photo, bio, place, interests };
}
