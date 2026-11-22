// Deterministic mock data. 36 profiles; 12 of them have already liked the logged-in user.
const NAMES = [
  "Aarav", "Ananya", "Kabir", "Isha", "Rohan", "Meera", "Vihaan", "Diya", "Arjun", "Saanvi",
  "Aditya", "Kiara", "Reyansh", "Myra", "Ishaan", "Navya", "Dev", "Tara", "Yash", "Riya",
  "Karan", "Pooja", "Neil", "Sana", "Samar", "Anika", "Veer", "Zoya", "Harsh", "Mahi",
  "Tanmay", "Ira", "Dhruv", "Kavya", "Om", "Lavanya",
];
const PLACES = [
  "ABES Engineering College", "Delhi University", "IIT Delhi", "Amity University", "JNU",
  "Noida", "Gurugram", "Ghaziabad", "Jamia Millia Islamia", "Christ University, Bengaluru",
  "Symbiosis, Pune", "Mumbai", "Jaipur", "Lucknow",
];
const INTERESTS = [
  "Chess", "Coffee", "Football", "Street food", "Poetry", "Coding", "Trekking", "Cricket",
  "Indie music", "Photography", "Anime", "Stand-up comedy", "Baking", "Travel", "Gaming",
  "Yoga", "Books", "Podcasts", "Cycling", "Painting", "Dancing", "Movies", "Journaling",
];
const BIOS = [
  "Will trade my last samosa for a good playlist.",
  "Overthinks texts, underthinks plans.",
  "Looking for someone who laughs at their own jokes too.",
  "Chai first, then we talk.",
  "Probably debugging something right now.",
  "Weekend trekker, weekday napper.",
  "I make a mean maggi. Ask me about it.",
  "Ask me about my favourite book, regret nothing.",
  "Shy at first, loud after five minutes.",
  "Here for good conversations and better memes.",
  "Always down for a late-night walk.",
  "Collecting sunsets and bad puns.",
];

// small seeded PRNG so every install gets the same data
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeed() {
  const rand = mulberry32(42);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const profiles = NAMES.map((name, i) => {
    const interests = new Set();
    const n = 3 + Math.floor(rand() * 2);
    while (interests.size < n) interests.add(pick(INTERESTS));
    return {
      id: `p${String(i + 1).padStart(2, "0")}`,
      name,
      age: 19 + Math.floor(rand() * 8),
      // placeholder photo; the UI falls back to a gradient if it can't load
      photo: `https://picsum.photos/seed/coy-${i + 1}/600/800`,
      bio: pick(BIOS),
      place: pick(PLACES),
      interests: [...interests],
      // PRIVATE: whether this person already liked the logged-in user.
      // Never leaves the server (see lib/db.js -> publicProfile).
      likesYou: i % 3 === 0, // 12 of 36
    };
  });

  // Seeded Fisher-Yates so "likers" aren't predictable by feed position
  for (let i = profiles.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [profiles[i], profiles[j]] = [profiles[j], profiles[i]];
  }
  return profiles;
}
