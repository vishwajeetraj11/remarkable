import type { SupportedLanguage } from "./index";

export const WORD_SEARCH_THEMES = [
  { value: "animals", label: "Animals" },
  { value: "food", label: "Food" },
  { value: "colors", label: "Colors" },
  { value: "nature", label: "Nature" },
  { value: "body", label: "Body" },
] as const;

export const WORD_SEARCH_BANKS: Record<
  SupportedLanguage,
  Record<string, string[]>
> = {
  en: {
    animals: [
      "LION", "TIGER", "BEAR", "EAGLE", "SHARK", "WHALE", "HORSE",
      "SNAKE", "RABBIT", "MONKEY", "PARROT", "DOLPHIN", "PENGUIN",
      "GIRAFFE", "ELEPHANT", "CHEETAH", "GORILLA", "PANTHER",
    ],
    food: [
      "BREAD", "CHEESE", "APPLE", "BANANA", "CHICKEN", "TOMATO",
      "POTATO", "CARROT", "ONION", "PEPPER", "LEMON", "ORANGE",
      "PASTA", "SALMON", "BUTTER", "RICE", "WAFFLE", "MUFFIN",
    ],
    colors: [
      "RED", "BLUE", "GREEN", "YELLOW", "ORANGE", "PURPLE", "PINK",
      "BLACK", "WHITE", "BROWN", "GRAY", "SILVER", "GOLD", "VIOLET",
      "CRIMSON", "SCARLET", "IVORY", "INDIGO",
    ],
    nature: [
      "RIVER", "OCEAN", "FOREST", "MOUNTAIN", "VALLEY", "DESERT",
      "ISLAND", "MEADOW", "CLOUD", "THUNDER", "RAINBOW", "SUNRISE",
      "WATERFALL", "GLACIER", "VOLCANO", "CANYON", "BREEZE", "STREAM",
    ],
    body: [
      "HEAD", "HAND", "FOOT", "KNEE", "ELBOW", "SHOULDER", "FINGER",
      "HEART", "BRAIN", "MUSCLE", "STOMACH", "ANKLE", "WRIST",
      "SPINE", "CHEST", "TONGUE", "THROAT", "TEMPLE",
    ],
  },
  es: {
    animals: [
      "LEON", "TIGRE", "OSO", "AGUILA", "TIBURON", "BALLENA",
      "CABALLO", "SERPIENTE", "CONEJO", "MONO", "LORO", "DELFIN",
      "JIRAFA", "ELEFANTE", "GUEPARDO", "GORILA", "PANTERA", "LOBO",
    ],
    food: [
      "PAN", "QUESO", "MANZANA", "PLATANO", "POLLO", "TOMATE",
      "PATATA", "ZANAHORIA", "CEBOLLA", "PIMIENTO", "LIMON",
      "NARANJA", "ARROZ", "SALMON", "MANTEQUILLA", "GALLETA",
    ],
    colors: [
      "ROJO", "AZUL", "VERDE", "AMARILLO", "NARANJA", "MORADO",
      "ROSA", "NEGRO", "BLANCO", "MARRON", "GRIS", "PLATA",
      "DORADO", "VIOLETA", "CARMESI", "TURQUESA",
    ],
    nature: [
      "RIO", "OCEANO", "BOSQUE", "MONTANA", "VALLE", "DESIERTO",
      "ISLA", "PRADERA", "NUBE", "TRUENO", "ARCOIRIS", "AMANECER",
      "CASCADA", "GLACIAR", "VOLCAN", "BRISA", "ARROYO", "SELVA",
    ],
    body: [
      "CABEZA", "MANO", "PIE", "RODILLA", "CODO", "HOMBRO", "DEDO",
      "CORAZON", "CEREBRO", "MUSCULO", "ESTOMAGO", "TOBILLO",
      "MUNECA", "COLUMNA", "PECHO", "LENGUA", "CUELLO", "HUESO",
    ],
  },
  fr: {
    animals: [
      "LION", "TIGRE", "OURS", "AIGLE", "REQUIN", "BALEINE",
      "CHEVAL", "SERPENT", "LAPIN", "SINGE", "PERROQUET", "DAUPHIN",
      "GIRAFE", "ELEPHANT", "GUEPARD", "GORILLE", "PANTHERE", "LOUP",
    ],
    food: [
      "PAIN", "FROMAGE", "POMME", "BANANE", "POULET", "TOMATE",
      "CAROTTE", "OIGNON", "POIVRE", "CITRON", "ORANGE", "SAUMON",
      "BEURRE", "RIZ", "SALADE", "GATEAU", "MIEL", "OLIVE",
    ],
    colors: [
      "ROUGE", "BLEU", "VERT", "JAUNE", "ORANGE", "VIOLET", "ROSE",
      "NOIR", "BLANC", "MARRON", "GRIS", "ARGENT", "DORE", "POURPRE",
      "TURQUOISE", "ECARLATE", "IVOIRE", "INDIGO",
    ],
    nature: [
      "RIVIERE", "OCEAN", "FORET", "MONTAGNE", "VALLEE", "DESERT",
      "ILE", "PRAIRIE", "NUAGE", "TONNERRE", "AURORE", "CASCADE",
      "GLACIER", "VOLCAN", "CANYON", "BRISE", "RUISSEAU", "JUNGLE",
    ],
    body: [
      "TETE", "MAIN", "PIED", "GENOU", "COUDE", "EPAULE", "DOIGT",
      "COEUR", "CERVEAU", "MUSCLE", "ESTOMAC", "CHEVILLE", "POIGNET",
      "COLONNE", "POITRINE", "LANGUE", "GORGE", "NUQUE",
    ],
  },
  de: {
    animals: [
      "LOEWE", "TIGER", "BAER", "ADLER", "HAI", "WAL", "PFERD",
      "SCHLANGE", "HASE", "AFFE", "PAPAGEI", "DELFIN", "PINGUIN",
      "GIRAFFE", "ELEFANT", "GEPARD", "GORILLA", "PANTHER", "WOLF",
    ],
    food: [
      "BROT", "KAESE", "APFEL", "BANANE", "HUHN", "TOMATE",
      "KARTOFFEL", "KAROTTE", "ZWIEBEL", "PFEFFER", "ZITRONE",
      "ORANGE", "NUDELN", "LACHS", "BUTTER", "REIS", "HONIG", "OLIVE",
    ],
    colors: [
      "ROT", "BLAU", "GRUEN", "GELB", "ORANGE", "LILA", "ROSA",
      "SCHWARZ", "WEISS", "BRAUN", "GRAU", "SILBER", "GOLD",
      "VIOLETT", "PURPUR", "TUERKIS",
    ],
    nature: [
      "FLUSS", "OZEAN", "WALD", "BERG", "TAL", "WUESTE", "INSEL",
      "WIESE", "WOLKE", "DONNER", "REGENBOGEN", "WASSERFALL",
      "GLETSCHER", "VULKAN", "SCHLUCHT", "BRISE", "BACH", "DSCHUNGEL",
    ],
    body: [
      "KOPF", "HAND", "FUSS", "KNIE", "ELLBOGEN", "SCHULTER",
      "FINGER", "HERZ", "GEHIRN", "MUSKEL", "MAGEN", "KNOECHEL",
      "BRUST", "ZUNGE", "NACKEN", "RUECKEN", "KNOCHEN", "HALS",
    ],
  },
  pt: {
    animals: [
      "LEAO", "TIGRE", "URSO", "AGUIA", "TUBARAO", "BALEIA",
      "CAVALO", "SERPENTE", "COELHO", "MACACO", "PAPAGAIO",
      "GOLFINHO", "PINGUIM", "GIRAFA", "ELEFANTE", "GUEPARDO",
      "GORILA", "PANTERA", "LOBO",
    ],
    food: [
      "PAO", "QUEIJO", "MACA", "BANANA", "FRANGO", "TOMATE",
      "BATATA", "CENOURA", "CEBOLA", "PIMENTA", "LIMAO", "LARANJA",
      "ARROZ", "SALMAO", "MANTEIGA", "BOLO", "MEL", "AZEITONA",
    ],
    colors: [
      "VERMELHO", "AZUL", "VERDE", "AMARELO", "LARANJA", "ROXO",
      "ROSA", "PRETO", "BRANCO", "MARROM", "CINZA", "PRATA",
      "DOURADO", "VIOLETA", "CARMESIM", "TURQUESA",
    ],
    nature: [
      "RIO", "OCEANO", "FLORESTA", "MONTANHA", "VALE", "DESERTO",
      "ILHA", "CAMPINA", "NUVEM", "TROVAO", "ARCOIRIS", "AMANHECER",
      "CASCATA", "GLACIAR", "VULCAO", "BRISA", "RIACHO", "SELVA",
    ],
    body: [
      "CABECA", "MAO", "PE", "JOELHO", "COTOVELO", "OMBRO", "DEDO",
      "CORACAO", "CEREBRO", "MUSCULO", "ESTOMAGO", "TORNOZELO",
      "PULSO", "COLUNA", "PEITO", "LINGUA", "PESCOCO", "OSSO",
    ],
  },
};
