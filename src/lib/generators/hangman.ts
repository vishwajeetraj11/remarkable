/**
 * Printable Hangman sheets: themed secret words with blank slots, gallows
 * drawing boxes, and a per-round alphabet tracker.
 */

export interface HangmanRound {
  word: string;
  category: string;
}

export interface HangmanSheet {
  rounds: HangmanRound[];
  categories: string[];
}

const WORDS: Record<string, string[]> = {
  Animals: [
    "ELEPHANT", "GIRAFFE", "PENGUIN", "DOLPHIN", "CHEETAH", "KANGAROO",
    "FLAMINGO", "CROCODILE", "SQUIRREL", "OCTOPUS", "BUTTERFLY", "HEDGEHOG",
    "RACCOON", "PLATYPUS", "ARMADILLO", "CHIMPANZEE", "RHINOCEROS", "JELLYFISH",
  ],
  Food: [
    "SPAGHETTI", "AVOCADO", "PANCAKE", "CHOCOLATE", "SANDWICH", "OMELETTE",
    "DUMPLING", "CROISSANT", "PEPPERONI", "LASAGNA", "PRETZEL", "GUACAMOLE",
    "BARBECUE", "MUFFIN", "NOODLE", "WAFFLE", "BURRITO", "CUPCAKE",
  ],
  Places: [
    "LIBRARY", "MOUNTAIN", "RESTAURANT", "AIRPORT", "HOSPITAL", "MUSEUM",
    "LIGHTHOUSE", "LABORATORY", "PLAYGROUND", "CASTLE", "DESERT", "VOLCANO",
    "UNIVERSITY", "CATHEDRAL", "AMPHITHEATER", "observatory".toUpperCase(),
    "GREENHOUSE", "SKYSCRAPER",
  ],
  Sports: [
    "BASKETBALL", "GYMNASTICS", "MARATHON", "VOLLEYBALL", "BADMINTON",
    "WRESTLING", "ARCHERY", "CRICKET", "HOCKEY", "SURFING", "SKIING",
    "TRIATHLON", "HANDBALL", "FOOTBALL", "SWIMMING", "CYCLING", "BOXING", "ROWING",
  ],
  Jobs: [
    "TEACHER", "ENGINEER", "PLUMBER", "ARCHITECT", "SCIENTIST", "CARPENTER",
    "ELECTRICIAN", "JOURNALIST", "PHOTOGRAPHER", "MECHANIC", "CHEMIST",
    "LAWYER", "DENTIST", "FIREFIGHTER", "ASTRONAUT", "CHEF", "PILOT", "FARMER",
  ],
};

const CATEGORIES = Object.keys(WORDS);

export function generateHangmanSheet(
  roundCount = 8,
  categories: string[] = CATEGORIES,
  rng: () => number = Math.random
): HangmanSheet {
  const count = Math.max(1, Math.min(20, roundCount));
  // Unknown category names are ignored; an empty selection falls back to all.
  const selected = CATEGORIES.filter((c) => categories.includes(c));
  const activeCategories = selected.length > 0 ? selected : CATEGORIES;

  const used = new Set<string>();
  const rounds: HangmanRound[] = [];
  const totalAvailable = activeCategories.reduce(
    (sum, c) => sum + WORDS[c].length,
    0
  );
  const effectiveCount = Math.min(count, totalAvailable);

  let exhaustedRounds = 0;
  while (rounds.length < effectiveCount && exhaustedRounds < count * 40) {
    exhaustedRounds++;
    const category =
      activeCategories[Math.floor(rng() * activeCategories.length)];
    const pool = WORDS[category].filter((w) => !used.has(w));
    if (pool.length === 0) continue;
    const word = pool[Math.floor(rng() * pool.length)];
    used.add(word);
    rounds.push({ word, category });
  }

  return { rounds, categories: CATEGORIES };
}
