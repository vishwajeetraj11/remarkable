export interface CrosswordWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
  number: number;
}

export interface CrosswordPuzzle {
  grid: (string | null)[][];
  words: CrosswordWord[];
  size: number;
}

const THEMES: Record<string, { word: string; clue: string }[]> = {
  general: [
    { word: "APPLE", clue: "A common fruit, often red or green" },
    { word: "BRIDGE", clue: "Structure crossing a river or gap" },
    { word: "CLOUD", clue: "Fluffy mass floating in the sky" },
    { word: "DANCE", clue: "Move rhythmically to music" },
    { word: "EAGLE", clue: "Large bird of prey, national symbol of the USA" },
    { word: "FLAME", clue: "Visible part of a fire" },
    { word: "GLOBE", clue: "Spherical model of Earth" },
    { word: "HARBOR", clue: "Sheltered area of water for boats" },
    { word: "IMAGE", clue: "Visual representation of something" },
    { word: "JACKET", clue: "Short coat worn over clothing" },
    { word: "KNIGHT", clue: "Medieval armored warrior on horseback" },
    { word: "LEMON", clue: "Sour yellow citrus fruit" },
    { word: "MIRROR", clue: "Reflective surface used to see yourself" },
    { word: "NOVEL", clue: "A long work of fiction" },
    { word: "OCEAN", clue: "Vast body of salt water" },
    { word: "PIANO", clue: "Keyboard instrument with 88 keys" },
    { word: "QUEEN", clue: "Female monarch or chess piece" },
    { word: "RIVER", clue: "Large natural stream of water" },
  ],
  science: [
    { word: "ATOM", clue: "Smallest unit of a chemical element" },
    { word: "CELL", clue: "Basic structural unit of all living things" },
    { word: "DENSITY", clue: "Mass per unit volume of a substance" },
    { word: "ELECTRON", clue: "Negatively charged subatomic particle" },
    { word: "FOSSIL", clue: "Preserved remains of ancient organisms" },
    { word: "GRAVITY", clue: "Force that attracts objects toward Earth" },
    { word: "HYDROGEN", clue: "Lightest and most abundant element" },
    { word: "ION", clue: "Atom with a net electric charge" },
    { word: "KINETIC", clue: "___ energy: energy of motion" },
    { word: "LASER", clue: "Coherent beam of amplified light" },
    { word: "MAGNET", clue: "Object that attracts iron and steel" },
    { word: "NEUTRON", clue: "Neutral particle in the nucleus" },
    { word: "ORBIT", clue: "Path of one body around another in space" },
    { word: "PLASMA", clue: "Fourth state of matter; ionized gas" },
    { word: "QUARK", clue: "Fundamental particle making up protons" },
    { word: "RADIUS", clue: "Distance from center to edge of a circle" },
    { word: "SOLAR", clue: "___ system: our sun and its planets" },
    { word: "THERMAL", clue: "Relating to heat energy" },
  ],
  history: [
    { word: "AZTEC", clue: "Mesoamerican civilization conquered by Spain" },
    { word: "BRONZE", clue: "___ Age: era defined by this copper alloy" },
    { word: "CAESAR", clue: "Roman dictator assassinated in 44 BC" },
    { word: "DYNASTY", clue: "Series of rulers from the same family" },
    { word: "EMPIRE", clue: "Group of nations under a single ruler" },
    { word: "FEUDAL", clue: "___ system: medieval land-for-service hierarchy" },
    { word: "GOTHIC", clue: "Medieval architectural style with pointed arches" },
    { word: "HERALD", clue: "Official messenger carrying royal proclamations" },
    { word: "IRON", clue: "___ Age: period after the Bronze Age" },
    { word: "JULIUS", clue: "First name of the famous Roman general Caesar" },
    { word: "KHAN", clue: "Title of Mongol rulers, e.g. Genghis ___" },
    { word: "LEGION", clue: "Basic unit of the Roman army" },
    { word: "MAGNA", clue: "___ Carta: landmark English charter of 1215" },
    { word: "NILE", clue: "River central to ancient Egyptian civilization" },
    { word: "ORACLE", clue: "Greek prophetic shrine, e.g. at Delphi" },
    { word: "PHARAOH", clue: "Ruler of ancient Egypt" },
    { word: "ROMAN", clue: "Relating to the civilization centered in Italy" },
    { word: "SENATE", clue: "Governing council of ancient Rome" },
  ],
  nature: [
    { word: "ACORN", clue: "Nut produced by an oak tree" },
    { word: "BIRCH", clue: "Tree with distinctive white papery bark" },
    { word: "CORAL", clue: "Marine organism forming colorful reefs" },
    { word: "DELTA", clue: "Fan-shaped river mouth deposit" },
    { word: "EROSION", clue: "Wearing away of rock or soil by water or wind" },
    { word: "FJORD", clue: "Narrow sea inlet between steep cliffs" },
    { word: "GLACIER", clue: "Slow-moving mass of ice" },
    { word: "HABITAT", clue: "Natural environment of an organism" },
    { word: "IGUANA", clue: "Large tropical lizard with a crest" },
    { word: "JUNGLE", clue: "Dense tropical forest" },
    { word: "KELP", clue: "Large brown seaweed forming underwater forests" },
    { word: "LAGOON", clue: "Shallow body of water near the coast" },
    { word: "MAGMA", clue: "Molten rock beneath Earth's surface" },
    { word: "NECTAR", clue: "Sweet fluid in flowers, loved by bees" },
    { word: "OAK", clue: "Large tree that produces acorns" },
    { word: "POLLEN", clue: "Fine powder produced by flowers for fertilization" },
    { word: "QUARTZ", clue: "Common hard mineral found in many rocks" },
    { word: "RAPIDS", clue: "Fast-flowing turbulent section of a river" },
  ],
};

function makeGrid(size: number): (string | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function canPlace(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down",
  size: number
): boolean {
  const dr = direction === "down" ? 1 : 0;
  const dc = direction === "across" ? 1 : 0;

  // Check bounds
  const endRow = row + dr * (word.length - 1);
  const endCol = col + dc * (word.length - 1);
  if (endRow >= size || endCol >= size || row < 0 || col < 0) return false;

  let intersections = 0;

  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const cell = grid[r][c];

    if (cell !== null && cell !== word[i]) return false;
    if (cell === word[i]) intersections++;

    // Check cells perpendicular to placement don't have unexpected letters
    if (cell === null) {
      // Before the word starts
      if (i === 0) {
        const prevR = r - dr;
        const prevC = c - dc;
        if (prevR >= 0 && prevC >= 0 && grid[prevR][prevC] !== null) return false;
      }
      // After the word ends
      if (i === word.length - 1) {
        const nextR = r + dr;
        const nextC = c + dc;
        if (nextR < size && nextC < size && grid[nextR][nextC] !== null) return false;
      }

      // Check sides (perpendicular neighbors) only for new cells
      const sideR1 = r + dc;
      const sideC1 = c + dr;
      const sideR2 = r - dc;
      const sideC2 = c - dr;
      if (sideR1 >= 0 && sideR1 < size && sideC1 >= 0 && sideC1 < size && grid[sideR1][sideC1] !== null) return false;
      if (sideR2 >= 0 && sideR2 < size && sideC2 >= 0 && sideC2 < size && grid[sideR2][sideC2] !== null) return false;
    }
  }

  // The first word needs no intersections; subsequent words need at least one
  return intersections > 0 || isGridEmpty(grid);
}

function isGridEmpty(grid: (string | null)[][]): boolean {
  return grid.every((row) => row.every((cell) => cell === null));
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down"
): void {
  const dr = direction === "down" ? 1 : 0;
  const dc = direction === "across" ? 1 : 0;
  for (let i = 0; i < word.length; i++) {
    grid[row + dr * i][col + dc * i] = word[i];
  }
}

function findPlacements(
  grid: (string | null)[][],
  word: string,
  size: number
): { row: number; col: number; direction: "across" | "down" }[] {
  const placements: { row: number; col: number; direction: "across" | "down" }[] = [];

  for (const direction of ["across", "down"] as const) {
    const dr = direction === "down" ? 1 : 0;
    const dc = direction === "across" ? 1 : 0;

    // Try to intersect with existing letters
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== null) {
          for (let i = 0; i < word.length; i++) {
            if (word[i] === grid[r][c]) {
              const startR = r - dr * i;
              const startC = c - dc * i;
              if (canPlace(grid, word, startR, startC, direction, size)) {
                placements.push({ row: startR, col: startC, direction });
              }
            }
          }
        }
      }
    }
  }

  return placements;
}

export function generateCrossword(theme: string): CrosswordPuzzle {
  const wordList = THEMES[theme] ?? THEMES["general"];
  const size = 15;
  const grid = makeGrid(size);
  const placedWords: CrosswordWord[] = [];

  // Shuffle the word list for variety
  const shuffled = [...wordList].sort(() => Math.random() - 0.5);

  let wordNumber = 1;

  for (const entry of shuffled) {
    const word = entry.word.toUpperCase();

    if (placedWords.length === 0) {
      // Place first word roughly centered horizontally
      const row = Math.floor(size / 2);
      const col = Math.floor((size - word.length) / 2);
      if (canPlace(grid, word, row, col, "across", size)) {
        placeWord(grid, word, row, col, "across");
        placedWords.push({ word, clue: entry.clue, row, col, direction: "across", number: wordNumber++ });
      }
    } else {
      const placements = findPlacements(grid, word, size);
      if (placements.length > 0) {
        // Pick a random valid placement
        const chosen = placements[Math.floor(Math.random() * placements.length)];
        placeWord(grid, word, chosen.row, chosen.col, chosen.direction);
        placedWords.push({ word, clue: entry.clue, row: chosen.row, col: chosen.col, direction: chosen.direction, number: wordNumber++ });
      }
    }

    if (placedWords.length >= 14) break;
  }

  // Assign numbers in reading order (top-to-bottom, left-to-right)
  const sorted = [...placedWords].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  );
  sorted.forEach((w, i) => { w.number = i + 1; });

  return { grid, words: sorted, size };
}
