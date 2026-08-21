/**
 * Per-game descriptive copy for crawler/LLM surfaces.
 *
 * Generator pages are almost pure UI (controls + canvas), which gives search
 * engines and AI crawlers nothing to quote. This registry supplies
 * answer-first intro copy, usage tips, and FAQ text for every game route.
 * `GeneratorSeoCopy` renders it below the generator; unknown paths render
 * nothing.
 */

export interface GameCopy {
  name: string;
  intro: string;
  tips: string[];
  faqs: { question: string; answer: string }[];
}

export const GAME_COPY: Record<string, GameCopy> = {
  "/games/sudoku": {
    name: "Sudoku",
    intro:
      "Sudoku is a logic puzzle where you fill a grid so every row, column, and box contains each digit exactly once. This generator creates unique sudoku PDFs in four grid sizes (4×4, 6×6, 9×9, 12×12) at four difficulties, sized for reMarkable tablets and standard paper.",
    tips: [
      "Start by scanning for rows, columns, or boxes missing only one digit.",
      "Use pencil marks (small candidate numbers) to track possibilities.",
      "New to sudoku? Choose the 4×4 or 6×6 grid size before reaching for 9×9.",
      "Multi-puzzle books include a tappable index page — jump between puzzles on your tablet.",
    ],
    faqs: [
      {
        question: "Are these sudoku puzzles unique?",
        answer:
          "Yes. Every PDF is generated fresh in your browser at download time, so no two puzzles are ever the same.",
      },
      {
        question: "Do the PDFs include solutions?",
        answer:
          "Yes. Answer keys are always included on the final pages of the PDF.",
      },
    ],
  },
  "/games/crossword": {
    name: "Crossword",
    intro:
      "A crossword is a word puzzle where you fill a grid of intersecting horizontal and vertical words from clues. This generator builds unique crossword PDFs with across/down clue lists, ready to print or load onto an e-ink tablet.",
    tips: [
      "Fill the longest words first — they anchor the rest of the grid.",
      "Crossings narrow letter choices quickly; solve intersecting words together.",
      "Use the custom crossword generator to make puzzles from your own vocabulary list.",
    ],
    faqs: [
      {
        question: "Can I make a crossword from my own words?",
        answer:
          "Yes. The custom crossword generator (/games/crossword/custom) accepts your own words and clues and lays them out into a printable grid.",
      },
    ],
  },
  "/games/word-search": {
    name: "Word Search",
    intro:
      "A word search hides a list of words inside a letter grid, placed horizontally, vertically, and diagonally. This generator creates themed word search PDFs — animals, food, sports, geography, and more — plus a custom mode for your own word list.",
    tips: [
      "Scan for the first two letters of a word rather than the whole word.",
      "Check diagonals last — that's where most hidden words end up.",
      "Teachers: use the custom generator to build spelling-list puzzles.",
    ],
    faqs: [
      {
        question: "Can I use my own word list?",
        answer:
          "Yes. /games/word-search/custom generates a word search PDF from any list of words you provide.",
      },
    ],
  },
  "/games/maze": {
    name: "Maze",
    intro:
      "A maze is a network of paths where you navigate from entrance to exit. Each generated maze is built with recursive backtracking, so every puzzle has exactly one solution path, in small, medium, and large sizes.",
    tips: [
      "Work backwards from the exit when the forward path branches heavily.",
      "Follow one wall continuously — it always leads somewhere in a perfect maze.",
      "Larger grids take longer but suit longer sessions on an e-ink tablet.",
    ],
    faqs: [
      {
        question: "Does every maze have a solution?",
        answer:
          "Yes. Each maze is generated with recursive backtracking, guaranteeing exactly one path from start to finish.",
      },
    ],
  },
  "/games/nonogram": {
    name: "Nonogram",
    intro:
      "A nonogram (also known as Picross or Griddler) is a picture logic puzzle: number clues on each row and column tell you the sizes of shaded cell runs, and solving reveals a hidden picture. Generated puzzles have unique solutions.",
    tips: [
      "Start with rows or columns whose clues span most of the line.",
      "Mark cells you know are empty — eliminations are as useful as fills.",
      "Look for completed clue sets to lock in lines early.",
    ],
    faqs: [
      {
        question: "Are nonograms solvable without guessing?",
        answer:
          "Yes. Puzzles are generated with unique solutions, so careful deduction alone completes them.",
      },
    ],
  },
  "/games/word-scramble": {
    name: "Word Scramble",
    intro:
      "A word scramble lists letters in jumbled order and challenges you to unscramble them into real words. Puzzles are themed by category and suitable for all ages.",
    tips: [
      "Look for common prefixes and suffixes first (un-, -ing, -tion).",
      "Write out vowels separately to spot likely letter pairings.",
      "Shorter scrambles warm you up before longer ones.",
    ],
    faqs: [
      {
        question: "What age group are word scrambles for?",
        answer:
          "All ages — themes range from easy everyday categories to more challenging vocabulary.",
      },
    ],
  },
  "/games/cryptogram": {
    name: "Cryptogram",
    intro:
      "A cryptogram encodes a famous quote or phrase with a random letter-substitution cipher. You decode it using frequency analysis, pattern recognition, and deduction.",
    tips: [
      "Single-letter words are almost always A or I.",
      "Common patterns like THE, AND, and -ING break ciphers open fast.",
      "Track your letter substitutions systematically as you confirm them.",
    ],
    faqs: [
      {
        question: "Is each cryptogram different?",
        answer:
          "Yes — both the quote selection and the cipher alphabet are randomized per generation.",
      },
    ],
  },
  "/games/kakuro": {
    name: "Kakuro",
    intro:
      "Kakuro (cross-sums) is a numeric crossword: fill each run of cells with digits 1–9 that sum to the clue at its end, without repeating digits within a run.",
    tips: [
      "Memorize small-sum combinations — e.g. 16 in three cells is nearly always 7+8+1 variants.",
      "Unique-combination clues (like 3 in two cells = 1+2) are the best starting points.",
      "Cross-check vertical and horizontal sums where runs intersect.",
    ],
    faqs: [
      {
        question: "How is Kakuro different from Sudoku?",
        answer:
          "Both restrict repeated digits, but Kakuro adds arithmetic: each run must sum exactly to its clue.",
      },
    ],
  },
  "/games/kenken": {
    name: "KenKen",
    intro:
      "KenKen is an arithmetic logic puzzle: cages of cells carry a target number and operation (+ − × ÷), and each row and column must contain unique digits while satisfying every cage.",
    tips: [
      "Cages with only one possible digit combination go first.",
      "In larger grids, remember rows and columns still can't repeat digits.",
      "Multiplication/division cages factor nicely — list factor pairs before starting.",
    ],
    faqs: [
      {
        question: "Is KenKen good for kids?",
        answer:
          "Yes — smaller grids with addition-only cages are a popular classroom arithmetic exercise.",
      },
    ],
  },
  "/games/futoshiki": {
    name: "Futoshiki",
    intro:
      "Futoshiki ('inequality') is a Latin-square puzzle: fill the grid with unique digits per row and column while obeying less-than and greater-than signs between adjacent cells.",
    tips: [
      "Process inequality signs first — they eliminate candidates immediately.",
      "Rows or columns with many signs are usually the easiest to complete.",
      "Combine sign constraints with row/column elimination to force placements.",
    ],
    faqs: [
      {
        question: "What does Futoshiki mean?",
        answer:
          "It's Japanese for 'inequality' — the puzzle's defining less-than/greater-than signs.",
      },
    ],
  },
  "/games/word-ladder": {
    name: "Word Ladder",
    intro:
      "A word ladder transforms a start word into an end word by changing one letter at a time, with every intermediate step forming a valid word. Fill in the missing rungs.",
    tips: [
      "Work from both ends toward the middle.",
      "Vowel-heavy words offer more single-letter neighbors.",
      "Say candidate words aloud — valid English words often surface by sound.",
    ],
    faqs: [
      {
        question: "Who invented word ladders?",
        answer:
          "Lewis Carroll popularized them in 1877, calling the puzzle 'Doublets'.",
      },
    ],
  },
  "/games/number-fill": {
    name: "Number Fill",
    intro:
      "Number fill (fill-in) puzzles give you a list of numbers to place into a crossword-style grid. Every number fits exactly once — logical elimination finds where.",
    tips: [
      "Place the longest numbers first; they have the fewest possible slots.",
      "Digit crossings constrain both numbers at once — check them constantly.",
      "Group the list by length to speed up scanning.",
    ],
    faqs: [
      {
        question: "Is there guessing involved?",
        answer:
          "No — every puzzle is solvable by pure elimination and cross-referencing.",
      },
    ],
  },
  "/games/logic-puzzle": {
    name: "Logic Puzzle",
    intro:
      "Classic deductive grid logic puzzles ('Einstein puzzles'): given a set of clues, determine the unique assignment of attributes — names, colors, pets, etc. — using a process-of-elimination grid.",
    tips: [
      "Transfer every clue onto the grid immediately; solved cells cascade.",
      "X-out impossible pairings as soon as a clue rules them out.",
      "Re-read remaining clues after each placement — new deductions unlock.",
    ],
    faqs: [
      {
        question: "Does every logic puzzle have one solution?",
        answer:
          "Yes. Each generated puzzle has exactly one consistent assignment derivable from the clues.",
      },
    ],
  },
};
