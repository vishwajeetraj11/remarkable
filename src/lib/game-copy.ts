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
  "/games/codeword": {
    name: "Codeword",
    intro:
      "A codeword (or codebreaker) puzzle is a crossword-style grid where every letter has been replaced by a number from 1 to 26. The same number always stands for the same letter, and three starting letters are given away for free. Deduce the rest from word patterns, letter frequency, and crossing words — no clues required.",
    tips: [
      "Start with single-letter cells: in English they are almost always A or I.",
      "Count letter frequencies — the most common code number is usually E.",
      "Look for common patterns like TH, HE, ING, and doubled letters (LL, EE).",
    ],
    faqs: [
      {
        question: "How do I solve a codeword without clues?",
        answer:
          "Use the three given letters as anchors, then apply letter frequency and common English patterns. Every placement constrains the crossing word, so deductions cascade quickly.",
      },
      {
        question: "Is every puzzle solvable without guessing?",
        answer:
          "Yes — the generator only publishes grids where the full letter assignment is uniquely recoverable, and every download includes the completed answer grid.",
      },
    ],
  },
  "/games/bingo": {
    name: "Bingo Cards",
    intro:
      "Printable bingo cards generated fresh every time. Classic 75-ball mode builds true B-I-N-G-O cards — column B draws from 1-15, I from 16-30, N from 31-45 with a free center, G from 46-60, and O from 61-75. Compact 3×3 and 4×4 modes use smaller number pools for faster rounds. Every download ends with a call sheet listing all balls in call order.",
    tips: [
      "Print one extra set of cards than you think you need — someone always wants a rematch.",
      "For classrooms, compact 3×3 games finish inside ten minutes.",
      "Cross off called numbers on the call sheet so you can verify winners later.",
    ],
    faqs: [
      {
        question: "What does 'true 75-ball column ranges' mean?",
        answer:
          "Traditional bingo assigns each column its own band of numbers: B 1-15, I 16-30, N 31-45, G 46-60, O 61-75. The classic mode follows that convention exactly, including the free center square.",
      },
      {
        question: "How many players can play with one download?",
        answer:
          "Each card is unique, so one card per player. Generate up to 12 classic cards or up to 20 compact 3×3 cards per PDF, and print the file again for a fresh set.",
      },
    ],
  },
  "/games/number-search": {
    name: "Number Search",
    intro:
      "Number search works like a word search, but the hidden items are digit sequences such as 407 or 9182. Sequences read left to right only — the classic magazine format — and this generator guarantees each sequence appears exactly once in the grid, so solvers never chase phantom matches.",
    tips: [
      "Scan row by row for the first two digits rather than the whole sequence.",
      "Longer sequences stand out — find them first to clear visual noise.",
      "Great warm-up for number recognition practice with kids.",
    ],
    faqs: [
      {
        question: "Can a number appear twice in the grid?",
        answer:
          "No. The generator checks the finished grid and guarantees every listed sequence occurs exactly once, including accidental matches formed by filler digits.",
      },
      {
        question: "Which directions do sequences read?",
        answer:
          "Left to right only, matching traditional printed number search books. Vertical and diagonal reading would make scanning far harder on paper and e-ink.",
      },
    ],
  },
  "/games/killer-sudoku": {
    name: "Killer Sudoku",
    intro:
      "Killer sudoku looks like an empty sudoku grid crossed with jigsaw pieces: the grid is partitioned into cages, each printed with a sum, and no digits are given at all. Digits 1-9 may not repeat within a cage, so cage sums plus standard sudoku rules are enough to reconstruct everything — provided the puzzle has exactly one solution, which this generator verifies with an exhaustive solver before publishing anything.",
    tips: [
      "Cages of two cells with small sums (3, 4, 16, 17) have very few digit splits — start there.",
      "Remember cage sums include the 45 rule: every row, column, and box totals exactly 45.",
      "Digits never repeat inside a cage, which is often stronger than the box constraint.",
    ],
    faqs: [
      {
        question: "Does every puzzle have a unique solution?",
        answer:
          "Yes. Each generated grid is checked by a solver that counts solutions up to two; only puzzles with exactly one solution are published. This check runs even though it takes a few extra seconds.",
      },
      {
        question: "How is this different from regular sudoku?",
        answer:
          "No starting digits are given. Instead, cages with printed sums provide all the information, and their shapes constrain where repeats are forbidden.",
      },
    ],
  },
  "/games/binairo": {
    name: "Binairo",
    intro:
      "Binairo (also known as Takuzu or Binario) is a binary logic puzzle played on even-sized grids. Fill every cell with 0 or 1 so that each row and column contains equal counts of both digits, no three identical digits appear consecutively in any direction, and no two rows or columns are identical. Every puzzle here is reduced from a full solution while a solver confirms uniqueness.",
    tips: [
      "Mark pairs first: any two identical digits with one gap force the middle cell.",
      "On the border between filled cells, 'two of a kind already placed' means the rest must be the other digit.",
      "Watch line uniqueness late-game — duplicate rows are the most common mistake.",
    ],
    faqs: [
      {
        question: "What do the dots on the printed grid mean?",
        answer:
          "Dots mark every second lattice intersection so counting cells in twos is easier on paper and e-ink screens.",
      },
      {
        question: "Which board size should I start with?",
        answer:
          "6×6 teaches all three rules in a couple of minutes; 8×8 is the classic daily-puzzle size; 10×10 and 12×12 add depth without new rules.",
      },
    ],
  },
  "/games/word-wheel": {
    name: "Word Wheel",
    intro:
      "A word wheel shows nine letters arranged around a center hub. Build as many words as you can from the letters — each word must include the center letter and may not use any ring letter more times than it appears. The generator draws fresh nine-letter wheels whose letters are all distinct, then computes the complete answer key from its dictionary so you always know the maximum score.",
    tips: [
      "Write down -ING, -ED, and -S extensions of words you already found.",
      "Plurals count separately — scan found words for easy +S additions.",
      "Aim for the longest word first to unlock letter patterns.",
    ],
    faqs: [
      {
        question: "How many words does a typical wheel contain?",
        answer:
          "Between roughly fifteen and forty depending on the seed letters. The exact total is printed on the answer page, so you can score a session objectively.",
      },
      {
        question: "Can letters be reused within a word?",
        answer:
          "Only as many times as the letter appears in the wheel — and since every wheel uses nine distinct letters, no letter can repeat inside a word at all.",
      },
    ],
  },
  "/games/hangman": {
    name: "Hangman",
    intro:
      "Printable hangman sheets for classrooms, road trips, and quiet afternoons. Each round prints a category hint, blank word slots, a framed box for drawing the gallows, and an alphabet tracker for crossing off guesses. Choose your categories — animals, food, places, sports, or jobs — and the difficulty follows from word length automatically.",
    tips: [
      "Guess vowels early — E and A appear in most English words.",
      "The category hint is powerful: narrow possibilities before guessing rare consonants.",
      "Two rounds print per page, so an eight-round sheet is four sheets front-to-back friendly.",
    ],
    faqs: [
      {
        question: "Are the secret words visible anywhere on the puzzle pages?",
        answer:
          "No — words only appear on the final answer-key page, so sheets can be handed out face-up.",
      },
      {
        question: "Can I limit the sheet to one category?",
        answer:
          "Yes. Pick Animals, Food, Places, Sports, or Jobs from the category selector and every round will come from that list.",
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
