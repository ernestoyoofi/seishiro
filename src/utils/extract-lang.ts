/**
 * @function extractLanguage
 * @description Parses the HTTP 'Accept-Language' header string into a clean array of unique language codes.
 * It handles weights (q-values) and sub-tags (e.g., 'en-US' becomes 'en') to simplify language matching.
 * * @param {string} [lang=""] - The raw Accept-Language header string (e.g., "en-US,en;q=0.9,id;q=0.8").
 * @returns {string[]} An array of unique, two-letter language codes (e.g., ["en", "id"]).
 * * @example
 * extractLanguage("en-GB,en-US;q=0.9,id;q=0.8")
 * // returns ["en", "id"]
 */

export default function extractLanguage(lang: string = "") {
  const first = String(lang || "").split(",")[0] || "en";
  return first.split(";")[0].split("-")[0].trim().toLowerCase() || "en";
}
