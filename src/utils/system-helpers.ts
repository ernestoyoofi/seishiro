/**
 * @function mapHeaders
 * @description Converts a Headers object or a plain object to a clean Record<string, string>.
 */
export function mapHeaders(headers: any): Record<string, string> {
  const ctx: Record<string, string> = {};
  if (!headers) return ctx;

  if (typeof headers.forEach === "function") {
    headers.forEach((val: string, key: string) => {
      ctx[key.toLowerCase()] = String(val).trim();
    });
  } else {
    for (const [key, val] of Object.entries(headers)) {
      ctx[key.toLowerCase()] = Array.isArray(val)
        ? val.join(", ")
        : String(val || "").trim();
    }
  }
  return ctx;
}

/**
 * @function getIp
 * @description Extracts IP address from various header sources.
 */
export function getIp(
  headers: Record<string, string>,
  remoteAddress?: string,
): string {
  return (
    headers["x-real-ip"] ||
    headers["x-forwarded-for"]?.split(",")[0].trim() ||
    remoteAddress ||
    "127.0.0.1"
  );
}

/**
 * @function getLocation
 * @description Extracts location string from common proxy headers.
 */
export function getLocation(headers: Record<string, string>): string {
  if (headers["x-vercel-ip-country"]) {
    return [
      headers["x-vercel-ip-country"],
      headers["x-vercel-ip-country-region"],
      headers["x-vercel-ip-city"],
    ]
      .filter(Boolean)
      .join(", ");
  }
  return headers["cf-ipcountry"] || "Local/Unknown";
}
