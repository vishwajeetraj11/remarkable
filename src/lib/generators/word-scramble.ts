export interface ScrambleEntry {
  scrambled: string;
  answer: string;
  hint: string;
}

export interface WordScramblePuzzle {
  scrambles: ScrambleEntry[];
}

type Difficulty = "easy" | "medium" | "hard";
type Category = "everyday" | "animals" | "food" | "science";

const WORD_BANK: Record<Category, Record<Difficulty, { word: string; hint: string }[]>> = {
  everyday: {
    easy: [
      { word: "BOOK", hint: "You read this" },
      { word: "DOOR", hint: "You open and close this" },
      { word: "LAMP", hint: "It provides light" },
      { word: "DESK", hint: "You work at this" },
      { word: "BALL", hint: "A round toy" },
      { word: "CHAIR", hint: "Something you sit on" },
      { word: "CLOCK", hint: "It tells you the time" },
      { word: "PHONE", hint: "Device for calling people" },
      { word: "BRUSH", hint: "Used to clean teeth or hair" },
      { word: "PLATE", hint: "You eat food from this" },
      { word: "SHELF", hint: "A flat board for storing things" },
      { word: "TOWEL", hint: "Used to dry yourself" },
    ],
    medium: [
      { word: "WINDOW", hint: "Transparent part of a wall" },
      { word: "BLANKET", hint: "Keeps you warm in bed" },
      { word: "CABINET", hint: "Storage furniture with doors" },
      { word: "CANDLE", hint: "Wax stick that you burn for light" },
      { word: "PILLOW", hint: "Soft support for your head" },
      { word: "CARPET", hint: "Floor covering made of fabric" },
      { word: "PENCIL", hint: "Writing tool with a graphite core" },
      { word: "MIRROR", hint: "Shows your reflection" },
      { word: "TICKET", hint: "Grants entry or passage" },
      { word: "WALLET", hint: "Small holder for cards and cash" },
      { word: "BASKET", hint: "Woven container for carrying things" },
      { word: "LADDER", hint: "Climbing tool with rungs" },
    ],
    hard: [
      { word: "CALENDAR", hint: "Shows dates of the year" },
      { word: "UMBRELLA", hint: "Keeps you dry in the rain" },
      { word: "FURNITURE", hint: "Movable objects like chairs and tables" },
      { word: "NEWSPAPER", hint: "Daily printed publication" },
      { word: "BOOKSHELF", hint: "Storage unit for books" },
      { word: "STAIRCASE", hint: "Steps connecting two floors" },
      { word: "TELEPHONE", hint: "Device for voice communication" },
      { word: "FIREPLACE", hint: "Indoor hearth for burning wood" },
      { word: "WARDROBE", hint: "Large closet for clothes" },
      { word: "ENVELOPE", hint: "Paper cover for a letter" },
      { word: "BATTERY", hint: "Stores electrical energy" },
      { word: "SCISSORS", hint: "Two-bladed cutting tool" },
    ],
  },
  animals: {
    easy: [
      { word: "BEAR", hint: "Large furry mammal that hibernates" },
      { word: "DUCK", hint: "Bird that quacks and swims" },
      { word: "FROG", hint: "Amphibian that jumps and croaks" },
      { word: "WOLF", hint: "Wild canine that howls" },
      { word: "DEER", hint: "Graceful animal with antlers" },
      { word: "CRAB", hint: "Crustacean that walks sideways" },
      { word: "MOLE", hint: "Small burrowing mammal" },
      { word: "SWAN", hint: "Elegant white water bird" },
      { word: "WORM", hint: "Legless creature living in soil" },
      { word: "HAWK", hint: "Bird of prey with sharp talons" },
      { word: "TOAD", hint: "Warty cousin of the frog" },
      { word: "LYNX", hint: "Wild cat with tufted ears" },
    ],
    medium: [
      { word: "PARROT", hint: "Colorful bird that can mimic speech" },
      { word: "DONKEY", hint: "Stubborn pack animal related to a horse" },
      { word: "RABBIT", hint: "Fluffy mammal with long ears" },
      { word: "TURTLE", hint: "Reptile with a protective shell" },
      { word: "JAGUAR", hint: "Spotted big cat of the Americas" },
      { word: "MONKEY", hint: "Primate that swings through trees" },
      { word: "LIZARD", hint: "Scaly reptile with four legs" },
      { word: "SALMON", hint: "Fish that swims upstream to spawn" },
      { word: "WALRUS", hint: "Large marine mammal with tusks" },
      { word: "CONDOR", hint: "Largest flying land bird" },
      { word: "FERRET", hint: "Small domesticated carnivore" },
      { word: "BADGER", hint: "Burrowing mammal with black-and-white face" },
    ],
    hard: [
      { word: "ELEPHANT", hint: "Largest land animal with a trunk" },
      { word: "FLAMINGO", hint: "Pink wading bird standing on one leg" },
      { word: "HEDGEHOG", hint: "Small spiny mammal that rolls up" },
      { word: "SCORPION", hint: "Arachnid with a venomous tail sting" },
      { word: "KANGAROO", hint: "Australian marsupial that hops" },
      { word: "PORCUPINE", hint: "Rodent covered in sharp quills" },
      { word: "CROCODILE", hint: "Large reptile lurking in rivers" },
      { word: "CHAMELEON", hint: "Lizard that changes color" },
      { word: "WOLVERINE", hint: "Fierce, stocky member of the weasel family" },
      { word: "ALBATROSS", hint: "Seabird with the longest wingspan" },
      { word: "PANGOLIN", hint: "Scaly mammal that rolls into a ball" },
      { word: "PLATYPUS", hint: "Egg-laying mammal with a duck-like bill" },
    ],
  },
  food: {
    easy: [
      { word: "CAKE", hint: "Sweet baked dessert" },
      { word: "SOUP", hint: "Hot liquid meal in a bowl" },
      { word: "RICE", hint: "Staple grain of Asia" },
      { word: "MEAT", hint: "Animal flesh cooked as food" },
      { word: "CORN", hint: "Yellow vegetable on a cob" },
      { word: "FISH", hint: "Aquatic animal often eaten baked or fried" },
      { word: "PEAR", hint: "Teardrop-shaped fruit" },
      { word: "PLUM", hint: "Small purple stone fruit" },
      { word: "MILK", hint: "White drink from cows" },
      { word: "TOFU", hint: "Protein-rich food made from soybeans" },
      { word: "BEAN", hint: "Legume used in many dishes" },
      { word: "LIME", hint: "Small green citrus fruit" },
    ],
    medium: [
      { word: "WAFFLE", hint: "Grid-patterned breakfast food" },
      { word: "MUFFIN", hint: "Small domed baked cake" },
      { word: "PEPPER", hint: "Spicy seasoning or colorful vegetable" },
      { word: "BUTTER", hint: "Creamy spread made from churned cream" },
      { word: "CARROT", hint: "Orange root vegetable" },
      { word: "GINGER", hint: "Spicy root used in cooking and tea" },
      { word: "NOODLE", hint: "Long thin pasta or Asian staple" },
      { word: "YOGURT", hint: "Fermented dairy product" },
      { word: "ALMOND", hint: "Edible nut from a tree" },
      { word: "MANGO", hint: "Tropical stone fruit" },
      { word: "ORANGE", hint: "Citrus fruit with a peel" },
      { word: "SALMON", hint: "Pink-fleshed fish rich in omega-3" },
    ],
    hard: [
      { word: "BROCCOLI", hint: "Green cruciferous vegetable" },
      { word: "CINNAMON", hint: "Fragrant spice from tree bark" },
      { word: "EGGPLANT", hint: "Purple vegetable used in many cuisines" },
      { word: "AVOCADO", hint: "Creamy green fruit used in guacamole" },
      { word: "BLUEBERRY", hint: "Small dark-blue antioxidant-rich berry" },
      { word: "COURGETTE", hint: "British name for zucchini" },
      { word: "CRANBERRY", hint: "Tart red berry used in sauce" },
      { word: "ARTICHOKE", hint: "Thistle-like vegetable with edible leaves" },
      { word: "RASPBERRY", hint: "Soft red berry with a hollow center" },
      { word: "ASPARAGUS", hint: "Slender green spring vegetable" },
      { word: "CROISSANT", hint: "Buttery crescent-shaped pastry" },
      { word: "MUSHROOM", hint: "Edible fungus with a cap and stem" },
    ],
  },
  science: {
    easy: [
      { word: "ATOM", hint: "Smallest particle of an element" },
      { word: "HEAT", hint: "Form of thermal energy" },
      { word: "LENS", hint: "Curved glass that bends light" },
      { word: "ACID", hint: "Substance with pH below 7" },
      { word: "WAVE", hint: "Oscillation that transfers energy" },
      { word: "GENE", hint: "Unit of heredity in DNA" },
      { word: "CELL", hint: "Basic unit of life" },
      { word: "MASS", hint: "Amount of matter in an object" },
      { word: "COIL", hint: "Wound loop of wire or spring" },
      { word: "RUST", hint: "Iron oxide formed by oxidation" },
      { word: "VEIN", hint: "Blood vessel carrying blood to the heart" },
      { word: "MOON", hint: "Earth's natural satellite" },
    ],
    medium: [
      { word: "OXYGEN", hint: "Gas essential for breathing (O)" },
      { word: "NEURON", hint: "Nerve cell that transmits signals" },
      { word: "CARBON", hint: "Element found in all living things (C)" },
      { word: "PROTON", hint: "Positively charged particle in nucleus" },
      { word: "MAGNET", hint: "Object with north and south poles" },
      { word: "FOSSIL", hint: "Preserved remains of ancient life" },
      { word: "PHOTON", hint: "Particle of light" },
      { word: "ENZYME", hint: "Biological catalyst for reactions" },
      { word: "PLASMA", hint: "Fourth state of matter" },
      { word: "SODIUM", hint: "Metallic element in table salt (Na)" },
      { word: "PRISM", hint: "Glass shape that splits light into colors" },
      { word: "ALLOY", hint: "Mixture of two or more metals" },
    ],
    hard: [
      { word: "ELECTRON", hint: "Negatively charged subatomic particle" },
      { word: "NITROGEN", hint: "Most abundant gas in the atmosphere (N)" },
      { word: "CHLOROPHYLL", hint: "Green pigment enabling photosynthesis" },
      { word: "EVOLUTION", hint: "Change in species over generations" },
      { word: "GRAVITY", hint: "Force attracting masses together" },
      { word: "MOLECULE", hint: "Two or more bonded atoms" },
      { word: "BACTERIA", hint: "Single-celled microorganism" },
      { word: "CATALYST", hint: "Substance that speeds up a reaction" },
      { word: "ISOTOPE", hint: "Variant of an element with different neutron count" },
      { word: "REFRACTION", hint: "Bending of light as it changes medium" },
      { word: "OSMOSIS", hint: "Water movement through a semipermeable membrane" },
      { word: "CHROMOSOME", hint: "Structure carrying genetic information" },
    ],
  },
};

function scrambleWord(word: string): string {
  const letters = word.split("");
  // Fisher-Yates shuffle, retry if result equals original
  let result = word;
  let attempts = 0;
  while (result === word && attempts < 20) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    result = letters.join("");
    attempts++;
  }
  return result;
}

export function generateWordScramble(
  difficulty: string,
  category: string,
  count: number
): WordScramblePuzzle {
  const safeCategory = (WORD_BANK[category as Category] ? category : "everyday") as Category;
  const safeDifficulty = (["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium") as Difficulty;
  const pool = WORD_BANK[safeCategory][safeDifficulty];

  const safeCount = Math.min(count, pool.length);
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5).slice(0, safeCount);

  const scrambles: ScrambleEntry[] = shuffledPool.map(({ word, hint }) => ({
    scrambled: scrambleWord(word.toUpperCase()),
    answer: word.toUpperCase(),
    hint,
  }));

  return { scrambles };
}
