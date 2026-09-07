/**
 * Transliterate Devanagari (Nepali) text to Latin/Roman characters.
 * Used to convert Nepali post slugs into clean, readable URLs.
 *
 * Example: "अस्ति कुशको शव बनाएर दाहसंस्कार, आज जीवितै उद्धार" → "asti-kushko-shav-banaera-dahasanskar-aaj-jeevitai-uddhar"
 */

// Multi-character conjuncts, ligatures, and vowel signs (checked first)
const CONJUNCTS: [string, string][] = [
  ["क्ष", "ksha"],
  ["त्र", "tra"],
  ["ज्ञ", "gya"],
  ["श्र", "shra"],
  ["द्ध", "ddha"],
  ["द्व", "dwa"],
  ["द्य", "dya"],
  ["न्त", "nta"],
  ["न्द", "nda"],
  ["म्ब", "mba"],
  ["ङ्ग", "nga"],
  ["ञ्ज", "nja"],
  ["ण्ड", "nda"],
  ["न्न", "nna"],
  ["प्र", "pra"],
  ["ब्र", "bra"],
  ["क्र", "kra"],
  ["ग्र", "gra"],
  ["स्त", "sta"],
  ["स्थ", "stha"],
  ["स्व", "swa"],
  ["स्र", "sra"],
  ["ष्ट", "shta"],
  ["ष्ठ", "shtha"],
  ["ट्र", "tra"],
  ["ड्र", "dra"],
  ["ठ्र", "thra"],
  ["ढ्र", "dhra"],
  ["त्त", "tta"],
  ["क्त", "kta"],
  ["प्त", "pta"],
  ["ब्द", "bda"],
  ["ब्ध", "bdha"],
  ["ग्ध", "gdha"],
  ["श्च", "shcha"],
  ["स्म", "sma"],
  ["स्य", "sya"],
  ["त्य", "tya"],
  ["प्य", "pya"],
  ["व्य", "vya"],
  ["ब्य", "bya"],
  ["म्य", "mya"],
  ["क्य", "kya"],
  ["र्य", "rya"],
  ["ह्र", "hra"],
  ["ह्ण", "hna"],
  ["ह्न", "hna"],
  ["ह्म", "hma"],
  ["ह्य", "hya"],
  ["ह्व", "hwa"],
];

// Independent Vowels
const VOWELS: [string, string][] = [
  ["औ", "au"],
  ["ऐ", "ai"],
  ["आ", "aa"],
  ["ई", "ee"],
  ["ऊ", "oo"],
  ["अं", "an"],
  ["अः", "ah"],
  ["ओ", "o"],
  ["ए", "e"],
  ["उ", "u"],
  ["इ", "i"],
  ["अ", "a"],
  ["ऋ", "ri"],
];

// Dependent Vowel Signs (Matras)
const MATRAS: [string, string][] = [
  ["ौ", "au"],
  ["ै", "ai"],
  ["ा", "a"],
  ["ी", "ee"],
  ["ू", "oo"],
  ["ो", "o"],
  ["े", "e"],
  ["ु", "u"],
  ["ि", "i"],
  ["ृ", "ri"],
];

// Consonants
const CONSONANTS: [string, string][] = [
  ["क", "ka"],
  ["ख", "kha"],
  ["ग", "ga"],
  ["घ", "gha"],
  ["ङ", "nga"],
  ["च", "cha"],
  ["छ", "chha"],
  ["ज", "ja"],
  ["झ", "jha"],
  ["ञ", "nya"],
  ["ट", "ta"],
  ["ठ", "tha"],
  ["ड", "da"],
  ["ढ", "dha"],
  ["ण", "na"],
  ["त", "ta"],
  ["थ", "tha"],
  ["द", "da"],
  ["ध", "dha"],
  ["न", "na"],
  ["प", "pa"],
  ["फ", "pha"],
  ["ब", "ba"],
  ["भ", "bha"],
  ["म", "ma"],
  ["य", "ya"],
  ["र", "ra"],
  ["ल", "la"],
  ["व", "wa"],
  ["श", "sha"],
  ["ष", "sha"],
  ["स", "sa"],
  ["ह", "ha"],
];

// Special Modifiers
const SPECIALS: [string, string][] = [
  ["ं", "n"],
  ["ँ", "n"],
  ["ः", "h"],
  ["्", ""], // halant - removes inherent vowel
  ["ऽ", ""],
  ["।", " "], // purna biram to space
  ["॥", " "],
];

// Nepali Digits
const DIGITS: [string, string][] = [
  ["०", "0"],
  ["१", "1"],
  ["२", "2"],
  ["३", "3"],
  ["४", "4"],
  ["५", "5"],
  ["६", "6"],
  ["७", "7"],
  ["८", "8"],
  ["९", "9"],
];

/**
 * Transliterate a Devanagari string to Latin characters
 */
export function transliterateNepali(text: string): string {
  if (!text) return "";

  let result = text;

  const allMaps: [string, string][][] = [
    CONJUNCTS,
    VOWELS,
    MATRAS,
    CONSONANTS,
    SPECIALS,
    DIGITS,
  ];

  for (const map of allMaps) {
    for (const [from, to] of map) {
      result = result.split(from).join(to);
    }
  }

  return result;
}

/**
 * Convert a Nepali or mixed headline into a clean, URL-friendly romanized slug.
 * - Transliterates Devanagari to Romanized Latin
 * - Lowercases everything
 * - Replaces non-alphanumeric chars with hyphens
 * - Removes consecutive hyphens and trims
 */
export function transliterateSlug(slug: string): string {
  if (!slug) return "";

  const decoded = decodeURIComponent(slug);

  // Check if contains Devanagari characters
  const hasDevanagari = /[\u0900-\u097F]/.test(decoded);
  let processed = hasDevanagari ? transliterateNepali(decoded) : decoded;

  // Clean up: lowercase, replace non-alphanumeric with hyphens
  processed = processed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return processed;
}

/**
 * Check if a string contains Devanagari characters
 */
export function isDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}
