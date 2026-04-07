import { shuffleArray } from "@/lib/pdf-constants";

export interface CryptogramPuzzle {
  plaintext: string;
  ciphertext: string;
  key: Record<string, string>;
  hint: string;
}

const QUOTES: string[] = [
  "The only way to do great work is to love what you do",
  "In the middle of difficulty lies opportunity",
  "What we think we become",
  "The best time to plant a tree was twenty years ago the second best time is now",
  "It does not matter how slowly you go as long as you do not stop",
  "Life is what happens when you are busy making other plans",
  "The purpose of our lives is to be happy",
  "Get busy living or get busy dying",
  "You only live once but if you do it right once is enough",
  "Many of lifes failures are people who did not realize how close they were to success when they gave up",
  "If you want to live a happy life tie it to a goal not to people or things",
  "Never let the fear of striking out keep you from playing the game",
  "Money and success dont change people they merely amplify what is already there",
  "Not how long but how well you have lived is the main thing",
  "If life were predictable it would cease to be life and be without flavor",
  "The whole secret of a successful life is to find out what is ones destiny to do and then do it",
  "In order to write about life first you must live it",
  "The big lesson in life is never be scared of anyone or anything",
  "Sing like no one is listening love like you have never been hurt dance like nobody is watching",
  "Curiosity about life in all of its aspects is still the secret of great creative people",
  "Life is not a problem to be solved but a reality to be experienced",
  "The unexamined life is not worth living",
  "Turn your wounds into wisdom",
  "The way to get started is to quit talking and begin doing",
  "It is during our darkest moments that we must focus to see the light",
  "Do not go where the path may lead go instead where there is no path and leave a trail",
  "Spread love everywhere you go let no one ever come to you without leaving happier",
  "Tell me and I forget teach me and I remember involve me and I learn",
  "The greatest glory in living lies not in never falling but in rising every time we fall",
  "Life is really simple but we insist on making it complicated",
  "The mind is everything what you think you become",
  "An unexamined life is not worth living",
  "Strive not to be a success but rather to be of value",
  "I have learned that people will forget what you said people will forget what you did but people will never forget how you made them feel",
];

function generateCipherKey(): Record<string, string> {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let shuffled: string[];

  do {
    shuffled = shuffleArray(alphabet);
  } while (alphabet.some((ch, i) => ch === shuffled[i]));

  const key: Record<string, string> = {};
  alphabet.forEach((ch, i) => {
    key[ch] = shuffled[i];
  });
  return key;
}

function encrypt(plaintext: string, key: Record<string, string>): string {
  return plaintext
    .toUpperCase()
    .split("")
    .map((ch) => key[ch] ?? ch)
    .join("");
}

function generateHint(key: Record<string, string>, plaintext: string): string {
  const usedLetters = new Set(
    plaintext
      .toUpperCase()
      .split("")
      .filter((ch) => /[A-Z]/.test(ch))
  );

  const available = shuffleArray([...usedLetters]);
  const count = 2 + (Math.random() < 0.5 ? 1 : 0);
  const hintLetters = available.slice(0, count);

  return hintLetters.map((ch) => `${key[ch]} = ${ch}`).join(", ");
}

export function generateCryptogram(customQuote?: string): CryptogramPuzzle {
  const plaintext = customQuote ?? QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const key = generateCipherKey();
  const ciphertext = encrypt(plaintext, key);
  const hint = generateHint(key, plaintext);

  return { plaintext, ciphertext, key, hint };
}
