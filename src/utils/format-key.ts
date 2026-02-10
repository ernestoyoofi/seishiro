/**
 * @function formatKey
 * @description Sanitizes and standardizes a string key by removing whitespace and illegal characters.
 * It ensures that keys used in Registry, Message, and Policy builders remain consistent
 * and safe for object property mapping.
 * * @param {string} [strkey=""] - The raw string key to be formatted.
 * @param {string} Returns a sanitized string containing only alphanumeric characters,
 * hyphens (-), dots (.), and colons (:).
 * * @example
 * formatKey(" user:login @") // returns "user:login"
 * formatKey("System-Error!") // returns "System-error"
 */

export default function formatKey(strkey: string = ""): string {
  const keyStr = String(strkey || "")
    .trim()
    .replace(/[^a-zA-Z0-9-.:]/g, "");
  return String(keyStr || "").toLowerCase();
}
