export interface WordSearchPuzzle {
  grid: string[][];
  words: string[];
  size: number;
  placements: WordPlacement[];
}

export interface WordPlacement {
  word: string;
  row: number;
  col: number;
  direction: Direction;
}

type Direction = {
  dr: number;
  dc: number;
  name: string;
};

const DIRECTIONS: Direction[] = [
  { dr: 0, dc: 1, name: "right" },
  { dr: 0, dc: -1, name: "left" },
  { dr: 1, dc: 0, name: "down" },
  { dr: -1, dc: 0, name: "up" },
  { dr: 1, dc: 1, name: "down-right" },
  { dr: 1, dc: -1, name: "down-left" },
  { dr: -1, dc: 1, name: "up-right" },
  { dr: -1, dc: -1, name: "up-left" },
];

const THEMES: Record<string, string[]> = {
  animals: [
    "ELEPHANT", "GIRAFFE", "PENGUIN", "DOLPHIN", "CHEETAH",
    "GORILLA", "KANGAROO", "FLAMINGO", "CROCODILE", "PORCUPINE",
    "CHAMELEON", "WOLVERINE", "MANDRILL", "PLATYPUS", "ALBATROSS",
    "ARMADILLO", "CAPYBARA", "MONGOOSE",
  ],
  food: [
    "AVOCADO", "BROCCOLI", "CINNAMON", "EGGPLANT", "FOCACCIA",
    "GAZPACHO", "HUMMUS", "JALAPEÑO", "KIMCHI", "LASAGNA",
    "MOZZARELLA", "NOODLES", "PAPRIKA", "QUINOA", "RISOTTO",
    "SAFFRON", "TIRAMISU", "WAFFLES",
  ],
  science: [
    "ELECTRON", "NEUTRON", "PHOTON", "MOLECULE", "CATALYST",
    "DIFFUSION", "ENTROPY", "FISSION", "GRAVITY", "HYDROGEN",
    "ISOTOPE", "KINETIC", "NUCLEUS", "OSMOSIS", "POLYMER",
    "QUANTUM", "REACTION", "SPECTRUM",
  ],
  sports: [
    "BASKETBALL", "BADMINTON", "CRICKET", "DRIBBLE", "ENDURANCE",
    "FOOTBALL", "GYMNASTICS", "HANDBALL", "MARATHON", "OBSTACLE",
    "PENALTY", "QUARTERBACK", "RACQUET", "SPRINTING", "TRIATHLON",
    "VOLLEYBALL", "WRESTLING", "ARCHERY",
  ],
  geography: [
    "AMAZON", "BALKANS", "CANYON", "DELTA", "EQUATOR",
    "FJORD", "GLACIER", "HIMALAYA", "ISTHMUS", "JUNGLE",
    "LATITUDE", "MERIDIAN", "PENINSULA", "PLATEAU", "RAINFOREST",
    "SAVANNA", "TUNDRA", "VOLCANO",
  ],
  technology: [
    "ALGORITHM", "BANDWIDTH", "COMPILER", "DATABASE", "ENCRYPTION",
    "FIREWALL", "GATEWAY", "HARDWARE", "INTERFACE", "KERNEL",
    "LATENCY", "MIDDLEWARE", "NETWORK", "PROTOCOL", "RUNTIME",
    "SERVER", "TERMINAL", "VARIABLE",
  ],
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomLetter(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: Direction,
  size: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== "" && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: Direction
): void {
  for (let i = 0; i < word.length; i++) {
    grid[row + dir.dr * i][col + dir.dc * i] = word[i];
  }
}

export function generateWordSearch(
  theme: string,
  size: number = 15,
  customWords?: string[]
): WordSearchPuzzle {
  const clampedSize = Math.max(12, Math.min(20, size));
  const wordPool = customWords ?? THEMES[theme] ?? THEMES["animals"];

  // Pick words that fit in the grid
  const eligible = wordPool.filter((w) => w.length <= clampedSize);
  // Shuffle and pick up to 15
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  const words = shuffled.slice(0, Math.min(15, shuffled.length));

  const grid: string[][] = Array.from({ length: clampedSize }, () =>
    Array(clampedSize).fill("")
  );

  const placements: WordPlacement[] = [];

  for (const word of words) {
    let placed = false;
    // Try up to 200 times per word
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * clampedSize);
      const col = Math.floor(Math.random() * clampedSize);

      if (canPlace(grid, word, row, col, dir, clampedSize)) {
        placeWord(grid, word, row, col, dir);
        placements.push({ word, row, col, direction: dir });
        placed = true;
      }
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < clampedSize; r++) {
    for (let c = 0; c < clampedSize; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = randomLetter();
      }
    }
  }

  // Return only words that were actually placed
  const placedWords = placements.map((p) => p.word);

  return {
    grid,
    words: placedWords,
    size: clampedSize,
    placements,
  };
}
