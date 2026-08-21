/**
 * Hand-written descriptions for LLM-facing content indexes (llms-full.txt).
 *
 * Template descriptions are NOT stored here — they come from the template
 * catalog (`TEMPLATE_PACKS`) so new templates appear automatically. This
 * module only covers surfaces without a structured catalog: games, kids
 * activities, guides, and puzzle packs.
 */

export const GAME_DESCRIPTIONS: Record<string, string> = {
  "/games/sudoku":
    "Sudoku generator with four grid sizes — 4×4 (kids/warm-up), 6×6 (light), classic 9×9, and 12×12 (expert) — at Easy, Medium, Hard, and Evil difficulties. Single puzzles include answer keys; multi-puzzle downloads become a book with a tappable index page.",
  "/games/sudoku/easy": "Beginner-friendly sudoku with more given clues and simpler solving paths.",
  "/games/sudoku/medium": "Moderate sudoku with a balanced clue count and intermediate challenge.",
  "/games/sudoku/hard": "Challenging sudoku requiring more advanced deduction techniques.",
  "/games/sudoku/evil": "Expert-level sudoku with the fewest clues and toughest solving paths.",
  "/games/word-search":
    "Themed word search grids with a hidden word list placed horizontally, vertically, and diagonally. Themes rotate across categories like animals, food, sports, and geography.",
  "/games/word-search/custom":
    "Custom word search generator — create printable puzzles from your own word list.",
  "/games/crossword":
    "Auto-generated crossword puzzles with across/down clue lists. Grid size and word density vary per generation.",
  "/games/crossword/custom":
    "Custom crossword generator — build crossword PDFs from your own words and clues.",
  "/games/maze":
    "Printable mazes generated with recursive backtracking in small, medium, and large sizes. Each maze has exactly one solution path.",
  "/games/nonogram":
    "Nonogram (Picross/Griddler) logic puzzles — shade cells using row and column number clues to reveal a hidden picture. Uniquely solvable.",
  "/games/word-scramble":
    "Anagram-style word unscrambling puzzles themed by category. Suitable for all ages.",
  "/games/cryptogram":
    "Letter-substitution cipher puzzles — decode an encoded famous quote using frequency analysis and deduction.",
  "/games/kakuro":
    "Cross-sums (Kakuro) puzzles — fill cells with digits so each run sums to its clue without repeating digits.",
  "/games/kenken":
    "KenKen arithmetic constraint puzzles — cages of cells have a target number and operation; rows and columns must contain unique digits.",
  "/games/futoshiki":
    "Futoshiki inequality puzzles — fill the grid with unique digits per row and column while respecting less-than/greater-than signs.",
  "/games/word-ladder":
    "Word ladder puzzles — transform a start word into an end word one letter at a time, with every step a valid word.",
  "/games/number-fill":
    "Fill-in number puzzles — place a supplied list of numbers into a crossword-style grid.",
  "/games/logic-puzzle":
    "Classic deductive grid logic puzzles ('Einstein puzzles') — use the clues to determine the unique assignment of attributes.",
};

export const KIDS_DESCRIPTIONS: Record<string, string> = {
  "/kids/tracing": "Letter and shape tracing practice sheets for early childhood.",
  "/kids/math": "Arithmetic drill worksheets with configurable difficulty and problem count.",
  "/kids/math/custom": "Custom math worksheet generator — exact operations, number ranges, and problem counts.",
  "/kids/math/addition": "Printable addition drill worksheets.",
  "/kids/math/subtraction": "Printable subtraction drill worksheets.",
  "/kids/math/multiplication": "Printable multiplication drill worksheets.",
  "/kids/math/division": "Printable division drill worksheets.",
  "/kids/number-bonds": "Number bond practice sheets for early arithmetic fluency.",
  "/kids/coloring": "Simple printable coloring pages with animal and object outlines.",
  "/kids/connect-dots": "Dot-to-dot picture puzzles numbered sequentially to reveal a hidden image.",
  "/kids/sight-words": "Dolch and Fry sight word practice organized by grade level (K–3).",
  "/kids/sight-words/kindergarten": "Kindergarten sight word practice sheets.",
  "/kids/sight-words/1st-grade": "First grade sight word practice sheets.",
  "/kids/sight-words/2nd-grade": "Second grade sight word practice sheets.",
  "/kids/sight-words/3rd-grade": "Third grade sight word practice sheets.",
  "/kids/spelling": "Spelling word worksheets with trace, copy, and write-from-memory sections.",
  "/kids/cursive": "Cursive handwriting practice for individual letters and connected words.",
  "/kids/vocabulary": "Vocabulary building worksheets with word, definition, sentence, and illustration spaces.",
  "/kids/patterns": "Visual pattern recognition activities — identify and continue shape or color patterns.",
  "/kids/telling-time": "Clock-reading practice sheets with analog clock faces.",
  "/kids/money-counting": "Coin and bill counting worksheets for money math practice.",
};

export const GUIDE_DESCRIPTIONS: Record<string, string> = {
  "/guides/best-free-remarkable-templates-2026":
    "Curated roundup of the best free reMarkable templates for 2026 across planning, notes, study, and wellness.",
  "/guides/transfer-pdfs-to-tablet":
    "Step-by-step guide to transferring PDFs via USB, cloud sync, email-to-device, and third-party apps for reMarkable, Supernote, BOOX, and Kindle Scribe.",
  "/guides/printable-worksheets-for-homeschool":
    "Curated homeschool worksheet recommendations by subject and age band.",
  "/guides/adhd-productivity-templates":
    "Template recommendations designed for ADHD and executive-function support — low-friction planning pages and routines.",
  "/guides/puzzle-difficulty-guide":
    "How puzzle difficulty levels are calibrated across sudoku, kakuro, nonogram, and other generators.",
  "/guides/best-remarkable-planner-setup":
    "How to set up a planner system on a reMarkable tablet using free hyperlinked templates.",
  "/guides/free-dated-2026-calendar-eink":
    "Where to get a free dated 2026 calendar PDF sized for e-ink tablets, and how to import it.",
  "/guides/bullet-journaling-on-remarkable":
    "Bullet journaling on a reMarkable tablet — collections, logs, and hyperlinked spreads.",
};

export const PACK_DESCRIPTIONS: Record<string, string> = {
  "/packs/road-trip": "Travel-themed word searches, crosswords, mazes, and word scrambles in one PDF.",
  "/packs/classroom": "Math worksheets, spelling practice, sight words, and pattern sequences for classrooms.",
  "/packs/brain-training": "Sudoku, Kakuro, KenKen, cryptograms, and logic grids in one reasoning workout.",
  "/packs/logic-masters": "Five number-logic puzzle types — Sudoku, Kakuro, KenKen, Futoshiki, and logic grids.",
  "/packs/word-games": "Word searches, crosswords, word scrambles, and cryptograms in one vocabulary bundle.",
};
