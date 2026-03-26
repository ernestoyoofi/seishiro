/**
 * @function formatValue
 * @description Automatically detects and converts string-based values into their
 * respective primitive types (number, boolean, null, or string).
 * @param {any} value - The input value to format.
 * @returns {any} The formatted value in its detected type.
 */
export default function formatValue(value: any): any {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  // Boolean
  if (lower === "true") return true;
  if (lower === "false") return false;

  // Null & Undefined
  if (lower === "null") return null;
  if (lower === "undefined") return undefined;

  // Number (including integers, floats, Infinity)
  if (trimmed !== "" && !isNaN(Number(trimmed))) {
    return Number(trimmed);
  }

  // BigInt detection (e.g. "123n")
  if (/^-?\d+n$/.test(trimmed)) {
    try {
      return BigInt(trimmed.slice(0, -1));
    } catch {
      return value;
    }
  }

  // JSON detection (Array or Object)
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed;
    } catch {
      return value;
    }
  }

  // ISO Date detection (Basic check for YYYY-MM-DD...)
  // if (
  //   trimmed.length >= 10 &&
  //   /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(trimmed)
  // ) {
  //   const date = new Date(trimmed);
  //   if (!isNaN(date.getTime())) return date;
  // }

  return value;
}
