"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

type Theme =
  | "animals"
  | "food"
  | "colors-shapes"
  | "body-parts"
  | "nature"
  | "house";

interface VocabWord {
  word: string;
  definition: string;
}

const THEMES: Record<Theme, { label: string; words: VocabWord[] }> = {
  animals: {
    label: "Animals",
    words: [
      { word: "Lion", definition: "Large wild cat with a mane" },
      { word: "Eagle", definition: "Large bird of prey" },
      { word: "Dolphin", definition: "Intelligent ocean mammal" },
      { word: "Elephant", definition: "Largest land animal with a trunk" },
      { word: "Penguin", definition: "Flightless bird that swims" },
      { word: "Giraffe", definition: "Tallest animal with a long neck" },
      { word: "Rabbit", definition: "Small animal with long ears" },
      { word: "Whale", definition: "Giant mammal that lives in the sea" },
      { word: "Butterfly", definition: "Insect with colorful wings" },
      { word: "Turtle", definition: "Reptile with a hard shell" },
      { word: "Frog", definition: "Amphibian that hops and croaks" },
      { word: "Shark", definition: "Large ocean fish with sharp teeth" },
      { word: "Parrot", definition: "Colorful bird that can mimic speech" },
      { word: "Zebra", definition: "Horse-like animal with stripes" },
      { word: "Owl", definition: "Nocturnal bird with big eyes" },
      { word: "Bear", definition: "Large furry mammal" },
      { word: "Kangaroo", definition: "Animal that hops and has a pouch" },
      { word: "Octopus", definition: "Sea creature with eight arms" },
    ],
  },
  food: {
    label: "Food",
    words: [
      { word: "Apple", definition: "Round red or green fruit" },
      { word: "Bread", definition: "Baked food made from flour" },
      { word: "Carrot", definition: "Orange root vegetable" },
      { word: "Cheese", definition: "Food made from milk" },
      { word: "Egg", definition: "Oval food laid by hens" },
      { word: "Grape", definition: "Small round fruit in clusters" },
      { word: "Honey", definition: "Sweet golden liquid from bees" },
      { word: "Lemon", definition: "Sour yellow citrus fruit" },
      { word: "Mushroom", definition: "Fungus used in cooking" },
      { word: "Onion", definition: "Layered bulb vegetable" },
      { word: "Pasta", definition: "Food made from wheat dough" },
      { word: "Rice", definition: "Small white or brown grains" },
      { word: "Tomato", definition: "Red fruit used in sauces" },
      { word: "Walnut", definition: "Hard-shelled tree nut" },
      { word: "Banana", definition: "Long curved yellow fruit" },
      { word: "Pumpkin", definition: "Large round orange squash" },
    ],
  },
  "colors-shapes": {
    label: "Colors & Shapes",
    words: [
      { word: "Circle", definition: "Round shape with no corners" },
      { word: "Square", definition: "Shape with four equal sides" },
      { word: "Triangle", definition: "Shape with three sides" },
      { word: "Rectangle", definition: "Shape with two long and two short sides" },
      { word: "Oval", definition: "Egg-like rounded shape" },
      { word: "Diamond", definition: "Shape like a tilted square" },
      { word: "Star", definition: "Shape with pointed tips" },
      { word: "Heart", definition: "Symbol shape of love" },
      { word: "Red", definition: "Color of fire and roses" },
      { word: "Blue", definition: "Color of the sky and ocean" },
      { word: "Green", definition: "Color of grass and leaves" },
      { word: "Yellow", definition: "Color of the sun and bananas" },
      { word: "Purple", definition: "Mix of red and blue" },
      { word: "Orange", definition: "Color between red and yellow" },
      { word: "Pink", definition: "Light shade of red" },
      { word: "Brown", definition: "Color of wood and soil" },
    ],
  },
  "body-parts": {
    label: "Body Parts",
    words: [
      { word: "Brain", definition: "Organ inside your head for thinking" },
      { word: "Heart", definition: "Organ that pumps blood" },
      { word: "Lungs", definition: "Organs used for breathing" },
      { word: "Stomach", definition: "Organ that digests food" },
      { word: "Elbow", definition: "Joint in the middle of your arm" },
      { word: "Ankle", definition: "Joint connecting foot to leg" },
      { word: "Wrist", definition: "Joint connecting hand to arm" },
      { word: "Spine", definition: "Column of bones in your back" },
      { word: "Muscle", definition: "Body tissue that creates movement" },
      { word: "Skeleton", definition: "Framework of bones in the body" },
      { word: "Ribs", definition: "Curved bones protecting chest organs" },
      { word: "Shoulder", definition: "Joint where arm meets body" },
      { word: "Thumb", definition: "Shortest and thickest finger" },
      { word: "Tongue", definition: "Muscle in mouth for tasting" },
      { word: "Knuckle", definition: "Joint in your finger" },
      { word: "Heel", definition: "Back part of the foot" },
    ],
  },
  nature: {
    label: "Nature",
    words: [
      { word: "Mountain", definition: "Very tall landform with a peak" },
      { word: "River", definition: "Large flowing body of water" },
      { word: "Forest", definition: "Large area covered with trees" },
      { word: "Desert", definition: "Dry sandy area with little rain" },
      { word: "Ocean", definition: "Vast body of salt water" },
      { word: "Volcano", definition: "Mountain that erupts lava" },
      { word: "Glacier", definition: "Slow-moving mass of ice" },
      { word: "Island", definition: "Land surrounded by water" },
      { word: "Thunder", definition: "Loud sound during a storm" },
      { word: "Rainbow", definition: "Arc of colors in the sky" },
      { word: "Fossil", definition: "Preserved remains of ancient life" },
      { word: "Pebble", definition: "Small smooth stone" },
      { word: "Meadow", definition: "Open field of grass and flowers" },
      { word: "Canyon", definition: "Deep valley with steep walls" },
      { word: "Waterfall", definition: "Water flowing over a cliff edge" },
      { word: "Coral", definition: "Tiny sea creatures forming reefs" },
    ],
  },
  house: {
    label: "Around the House",
    words: [
      { word: "Curtain", definition: "Fabric covering a window" },
      { word: "Pillow", definition: "Soft cushion for resting your head" },
      { word: "Mirror", definition: "Glass that shows your reflection" },
      { word: "Faucet", definition: "Device that controls water flow" },
      { word: "Chimney", definition: "Tube for smoke to escape a house" },
      { word: "Drawer", definition: "Sliding box inside furniture" },
      { word: "Blanket", definition: "Warm covering for a bed" },
      { word: "Carpet", definition: "Thick fabric covering a floor" },
      { word: "Shelf", definition: "Flat board for holding items" },
      { word: "Ceiling", definition: "Top surface of a room" },
      { word: "Doorbell", definition: "Button that rings when pressed" },
      { word: "Pantry", definition: "Small room for storing food" },
      { word: "Attic", definition: "Space below the roof" },
      { word: "Staircase", definition: "Set of steps between floors" },
      { word: "Bathtub", definition: "Container for bathing" },
      { word: "Lantern", definition: "Portable enclosed light" },
    ],
  },
};

export default function VocabularyPage() {
  const [theme, setTheme] = useState<Theme>("animals");
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const [pageCount, setPageCount] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);

  const themeData = THEMES[theme];

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 28;
    const usableW = w - margin * 2;
    const usableH = h - margin * 2;

    const cols = cardsPerPage <= 4 ? 2 : cardsPerPage <= 6 ? 2 : 2;
    const rows = Math.ceil(cardsPerPage / cols);
    const cardW = usableW / cols;
    const cardH = usableH / rows;

    const words = themeData.words;
    let wordIdx = 0;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      for (let i = 0; i < cardsPerPage; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = margin + col * cardW;
        const cy = margin + row * cardH;
        const card = words[wordIdx % words.length];
        wordIdx++;

        // Dashed cut-line border
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([4, 3], 0);
        doc.rect(cx + 2, cy + 2, cardW - 4, cardH - 4, "S");
        doc.setLineDashPattern([], 0);

        const innerPad = 14;
        const innerX = cx + innerPad;
        const innerW = cardW - innerPad * 2;
        const innerY = cy + innerPad;

        // Word in large bold text
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 20, 20);
        doc.text(card.word, innerX + innerW / 2, innerY + 24, {
          align: "center",
        });

        // Dotted line separator
        const sepY = innerY + 34;
        doc.setDrawColor(160, 160, 160);
        doc.setLineWidth(0.6);
        doc.setLineDashPattern([2, 3], 0);
        doc.line(innerX + 10, sepY, innerX + innerW - 10, sepY);
        doc.setLineDashPattern([], 0);

        // Definition below
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const defLines = doc.splitTextToSize(card.definition, innerW - 20);
        doc.text(defLines, innerX + innerW / 2, sepY + 16, {
          align: "center",
        });

        // "Draw it" box
        const boxTopY = sepY + 16 + defLines.length * 14 + 8;
        const boxH = cy + cardH - innerPad - boxTopY - 4;
        if (boxH > 20) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.4);
          doc.setLineDashPattern([3, 2], 0);
          doc.rect(innerX + 8, boxTopY, innerW - 16, boxH, "S");
          doc.setLineDashPattern([], 0);

          doc.setFontSize(7);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(170, 170, 170);
          doc.text("Draw it!", innerX + innerW / 2, boxTopY + 10, {
            align: "center",
          });
        }
      }
    }

    doc.save(`vocabulary-${theme}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  const previewCards = themeData.words.slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Vocabulary Flashcards
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Themed vocabulary cards with words, definitions, and drawing space for
          visual learners.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Theme</Label>
          <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(THEMES).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Cards per page</Label>
          <Select
            value={String(cardsPerPage)}
            onValueChange={(v) => setCardsPerPage(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 cards (2×2)</SelectItem>
              <SelectItem value="6">6 cards (2×3)</SelectItem>
              <SelectItem value="8">8 cards (2×4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pages: {pageCount}</Label>
          <Slider
            min={1}
            max={6}
            value={[pageCount]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setPageCount(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>6</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Page size</Label>
          <Select
            value={pageSize}
            onValueChange={(v) => setPageSize(v as PageSizeKey)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAGE_SIZES).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
          Preview
        </h2>
        <div className="border border-border rounded-xl bg-white p-5">
          <div className="grid grid-cols-2 gap-3">
            {previewCards.map((card, i) => (
              <div
                key={i}
                className="border border-dashed border-border rounded-lg p-4 text-center"
              >
                <div className="text-lg font-bold mb-1">{card.word}</div>
                <div className="border-t border-dotted border-muted-foreground/30 my-2" />
                <div className="text-xs text-muted-foreground mb-3">
                  {card.definition}
                </div>
                <div className="border border-dashed border-border/50 rounded h-14 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/40 italic">
                    Draw it!
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {themeData.words.length} words in the {themeData.label} theme.
            Dashed cut-lines between cards.
          </p>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating
          ? "Generating…"
          : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
