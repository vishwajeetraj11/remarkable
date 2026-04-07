export type LogicDifficulty = "easy" | "medium" | "hard";

export interface LogicGridPuzzle {
  title: string;
  description: string;
  categories: { name: string; items: string[] }[];
  clues: string[];
  solution: Record<string, Record<string, string>>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

interface ScenarioTemplate {
  title: string;
  descriptionTemplate: string;
  categoryPools: { name: string; pool: string[] }[];
}

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    title: "Neighborhood Friends",
    descriptionTemplate:
      "Five friends live on the same street. Each has a different pet, favorite color, and hobby. Use the clues to figure out who has what.",
    categoryPools: [
      { name: "Name", pool: ["Alice", "Ben", "Clara", "Derek", "Eva", "Frank", "Grace", "Hank", "Ivy", "Jack"] },
      { name: "Pet", pool: ["cat", "dog", "fish", "bird", "hamster", "turtle", "rabbit", "lizard"] },
      { name: "Color", pool: ["red", "blue", "green", "yellow", "purple", "orange", "pink", "teal"] },
      { name: "Hobby", pool: ["painting", "gardening", "cooking", "reading", "cycling", "knitting", "hiking", "chess"] },
    ],
  },
  {
    title: "Office Lunch",
    descriptionTemplate:
      "Several coworkers each ordered a different lunch, drink, and dessert. Figure out each person's complete order.",
    categoryPools: [
      { name: "Person", pool: ["Maya", "Oscar", "Priya", "Quinn", "Rita", "Sam", "Tina", "Uma"] },
      { name: "Lunch", pool: ["pizza", "salad", "sandwich", "sushi", "pasta", "tacos", "soup", "burger"] },
      { name: "Drink", pool: ["coffee", "tea", "juice", "water", "soda", "lemonade", "smoothie", "milk"] },
      { name: "Dessert", pool: ["cake", "pie", "ice cream", "brownie", "cookie", "fruit", "pudding", "muffin"] },
    ],
  },
  {
    title: "School Fair",
    descriptionTemplate:
      "Students each run a different booth at the school fair. Each booth is in a different zone and each student wears a different color shirt.",
    categoryPools: [
      { name: "Student", pool: ["Leo", "Mia", "Noah", "Olivia", "Pat", "Remy", "Sara", "Toby"] },
      { name: "Booth", pool: ["face painting", "ring toss", "bake sale", "balloon darts", "photo booth", "fortune telling", "craft table", "dunk tank"] },
      { name: "Zone", pool: ["north field", "south field", "east hall", "west hall", "gymnasium", "courtyard", "cafeteria", "lobby"] },
      { name: "Shirt", pool: ["red", "blue", "green", "yellow", "white", "black", "orange", "purple"] },
    ],
  },
  {
    title: "Vacation Plans",
    descriptionTemplate:
      "A group of friends are each traveling to a different city by a different mode of transport during a different month.",
    categoryPools: [
      { name: "Traveler", pool: ["Anna", "Boris", "Chloe", "Dante", "Elena", "Felix", "Greta", "Hugo"] },
      { name: "City", pool: ["Paris", "Tokyo", "Sydney", "Cairo", "Lima", "Oslo", "Seoul", "Rome"] },
      { name: "Transport", pool: ["plane", "train", "car", "bus", "boat", "bicycle", "motorcycle", "ferry"] },
      { name: "Month", pool: ["January", "March", "May", "July", "September", "November", "February", "April"] },
    ],
  },
  {
    title: "Music Festival",
    descriptionTemplate:
      "Several musicians are each performing on a different stage, playing a different genre, and wearing a different accessory.",
    categoryPools: [
      { name: "Musician", pool: ["Aria", "Blake", "Carmen", "Drake", "Echo", "Flora", "Grant", "Haven"] },
      { name: "Stage", pool: ["main stage", "tent A", "tent B", "acoustic corner", "rooftop", "lakeside", "amphitheater", "garage"] },
      { name: "Genre", pool: ["jazz", "rock", "folk", "electronic", "classical", "blues", "pop", "reggae"] },
      { name: "Accessory", pool: ["hat", "scarf", "sunglasses", "bracelet", "bandana", "necklace", "watch", "ring"] },
    ],
  },
  {
    title: "Book Club",
    descriptionTemplate:
      "Each member of a book club picked a different genre, reads at a different time of day, and has a different favorite snack while reading.",
    categoryPools: [
      { name: "Reader", pool: ["Wendy", "Xavier", "Yara", "Zane", "Abby", "Brian", "Cora", "Dion"] },
      { name: "Genre", pool: ["mystery", "sci-fi", "romance", "biography", "fantasy", "thriller", "history", "poetry"] },
      { name: "Time", pool: ["morning", "noon", "afternoon", "evening", "night", "dawn", "dusk", "late night"] },
      { name: "Snack", pool: ["chips", "popcorn", "fruit", "chocolate", "nuts", "crackers", "cookies", "pretzels"] },
    ],
  },
  {
    title: "Garden Show",
    descriptionTemplate:
      "Gardeners each grow a different flower, use a different type of pot, and placed their entry in a different row at the show.",
    categoryPools: [
      { name: "Gardener", pool: ["Fern", "Glen", "Holly", "Ivan", "Jade", "Kent", "Luna", "Moss"] },
      { name: "Flower", pool: ["rose", "tulip", "daisy", "orchid", "lily", "sunflower", "violet", "peony"] },
      { name: "Pot", pool: ["terracotta", "ceramic", "wooden", "stone", "metal", "glass", "plastic", "wicker"] },
      { name: "Row", pool: ["row 1", "row 2", "row 3", "row 4", "row 5", "row 6", "row 7", "row 8"] },
    ],
  },
  {
    title: "Movie Night",
    descriptionTemplate:
      "Friends each picked a different movie genre, brought a different snack, and sat in a different row of the theater.",
    categoryPools: [
      { name: "Friend", pool: ["Kai", "Lena", "Marco", "Nadia", "Owen", "Pia", "Reed", "Suki"] },
      { name: "Genre", pool: ["action", "comedy", "horror", "drama", "animation", "documentary", "sci-fi", "romance"] },
      { name: "Snack", pool: ["popcorn", "nachos", "candy", "pretzels", "soda", "hot dog", "ice cream", "trail mix"] },
      { name: "Seat", pool: ["front row", "second row", "third row", "fourth row", "fifth row", "balcony", "aisle", "center"] },
    ],
  },
];

const DIFFICULTY_CONFIG: Record<LogicDifficulty, { size: number; numCategories: number }> = {
  easy: { size: 3, numCategories: 3 },
  medium: { size: 4, numCategories: 4 },
  hard: { size: 5, numCategories: 4 },
};

type Assignment = Record<string, string>;

function buildSolution(
  categories: { name: string; items: string[] }[],
  size: number
): { solution: Record<string, Record<string, string>>; rows: Assignment[] } {
  const primary = categories[0];
  const others = categories.slice(1);

  const shuffledOthers = others.map((cat) => ({
    name: cat.name,
    items: shuffle(cat.items),
  }));

  const solution: Record<string, Record<string, string>> = {};
  const rows: Assignment[] = [];

  for (let i = 0; i < size; i++) {
    const key = primary.items[i];
    const row: Assignment = { [primary.name]: key };
    solution[key] = {};
    for (const cat of shuffledOthers) {
      solution[key][cat.name] = cat.items[i];
      row[cat.name] = cat.items[i];
    }
    rows.push(row);
  }

  return { solution, rows };
}

function generateClues(
  categories: { name: string; items: string[] }[],
  rows: Assignment[],
  size: number
): string[] {
  const clues: string[] = [];
  const primary = categories[0];
  const otherCats = categories.slice(1);

  for (let i = 0; i < size; i++) {
    const personName = rows[i][primary.name];

    for (const cat of otherCats) {
      const val = rows[i][cat.name];
      const wrongVals = cat.items.filter((v) => v !== val);

      const r = Math.random();

      if (r < 0.35) {
        clues.push(`${personName}'s ${cat.name.toLowerCase()} is ${val}.`);
      } else if (r < 0.6) {
        const wrongVal = wrongVals[Math.floor(Math.random() * wrongVals.length)];
        clues.push(
          `${personName}'s ${cat.name.toLowerCase()} is not ${wrongVal}.`
        );
      } else if (r < 0.8) {
        const otherIdx = (i + 1) % size;
        const otherVal = rows[otherIdx][cat.name];
        clues.push(
          `The one whose ${cat.name.toLowerCase()} is ${val} is not the same as the one whose ${cat.name.toLowerCase()} is ${otherVal}.`
        );
      } else {
        const otherCat =
          otherCats[Math.floor(Math.random() * otherCats.length)];
        const otherVal = rows[i][otherCat.name];
        if (otherCat.name !== cat.name) {
          clues.push(
            `The one with ${val} also has ${otherVal}.`
          );
        } else {
          clues.push(`${personName}'s ${cat.name.toLowerCase()} is ${val}.`);
        }
      }
    }
  }

  const directCount = clues.filter((c) =>
    c.includes("'s ") && c.includes(" is ") && !c.includes(" not ")
  ).length;

  if (directCount < 2) {
    const person = rows[0][primary.name];
    const cat = otherCats[0];
    const val = rows[0][cat.name];
    clues.unshift(`${person}'s ${cat.name.toLowerCase()} is ${val}.`);
  }

  for (const cat of otherCats) {
    const hasDirect = clues.some(
      (c) =>
        c.includes(`${cat.name.toLowerCase()} is `) &&
        !c.includes(" not ") &&
        !c.includes("not the same")
    );
    if (!hasDirect) {
      const idx = Math.floor(Math.random() * size);
      const person = rows[idx][primary.name];
      const val = rows[idx][cat.name];
      clues.push(`${person}'s ${cat.name.toLowerCase()} is ${val}.`);
    }
  }

  return shuffle(clues);
}

export function generateLogicGrid(difficulty: LogicDifficulty): LogicGridPuzzle {
  const config = DIFFICULTY_CONFIG[difficulty];
  const template =
    SCENARIO_TEMPLATES[Math.floor(Math.random() * SCENARIO_TEMPLATES.length)];

  const numCats = Math.min(config.numCategories, template.categoryPools.length);
  const selectedPools = template.categoryPools.slice(0, numCats);

  const categories = selectedPools.map((pool) => ({
    name: pool.name,
    items: pick(pool.pool, config.size),
  }));

  const { solution, rows } = buildSolution(categories, config.size);
  const clues = generateClues(categories, rows, config.size);

  const sizeLabel =
    config.size === 3 ? "three" : config.size === 4 ? "four" : "five";
  const description = template.descriptionTemplate.replace(
    /Five|Several|Each member of a|Students|A group of|Gardeners|Friends/i,
    (match) => {
      if (match.toLowerCase() === "five") return sizeLabel.charAt(0).toUpperCase() + sizeLabel.slice(1);
      return match;
    }
  );

  return {
    title: template.title,
    description,
    categories,
    clues,
    solution,
  };
}
