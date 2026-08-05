/**
 * Transliterate Devanagari (Nepali) text to Latin/Roman characters.
 * Used to convert Nepali post slugs into clean, readable URLs.
 *
 * Example: "अर्बौं-रुपैयाँ-राजस्व" → "arbau-rupaiya-rajaswa"
 */

// Multi-character conjuncts and vowel signs (must be checked BEFORE single chars)
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
  ["ट्र", "tra"],
];

// Vowels (independent forms)
const VOWELS: [string, string][] = [
  ["औ", "au"],
  ["ऐ", "ai"],
  ["आ", "aa"],
  ["ई", "ee"],
  ["ऊ", "oo"],
  ["अं", "am"],
  ["अः", "ah"],
  ["ओ", "o"],
  ["ए", "e"],
  ["उ", "u"],
  ["इ", "i"],
  ["अ", "a"],
  ["ऋ", "ri"],
];

// Vowel signs (matras - dependent forms)
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

// Special characters
const SPECIALS: [string, string][] = [
  ["ं", "n"],
  ["ँ", "n"],
  ["ः", "h"],
  ["्", ""],   // halant - suppresses inherent vowel
];

// Nepali digits
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

  // Apply in order: conjuncts first, then vowels, matras, consonants, specials, digits
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
 * Convert a Nepali slug to a clean, URL-friendly romanized slug.
 * - Transliterates Devanagari to Latin
 * - Lowercases everything
 * - Replaces spaces/special chars with hyphens
 * - Removes consecutive hyphens
 * - Trims leading/trailing hyphens
 */
export function transliterateSlug(slug: string): string {
  if (!slug) return "";

  const decoded = decodeURIComponent(slug);

  // Check if the slug contains any Devanagari characters
  const hasDevanagari = /[\u0900-\u097F]/.test(decoded);
  if (!hasDevanagari) return slug; // Already Latin, return as-is

  let romanized = transliterateNepali(decoded);

  // Clean up: lowercase, replace non-alphanumeric with hyphens
  romanized = romanized
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, "-")  // replace non-alphanumeric with hyphen
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .replace(/^-|-$/g, "");          // trim leading/trailing hyphens

  return romanized;
}

/**
 * Check if a string contains Devanagari characters
 */
export function isDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}
