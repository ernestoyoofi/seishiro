/**
 * @function ActionRequest
 * @description Processes a Hono Context object to extract system metadata,
 * authentication context (headers/cookies), and the payload (type/data).
 * @param {any} c - The Hono Context object (c).
 * @returns {Promise<Object>} A formatted object containing system context and business data.
 */
import { mapHeaders, getIp, getLocation } from "../utils/system-helpers.js";

export async function ActionRequest(c: any) {
  const header_ctx = mapHeaders(c.req.header());
  const cookie_ctx: Record<string, string> = {};
  (c.req.header("cookie") || "").split(";").forEach((p: string) => {
    const [k, v] = p.split("=").map((i) => i.trim());
    if (k && v) cookie_ctx[k] = v;
  });

  let bodydata: any = { type: "", data: {} };
  try {
    const ct = c.req.header("content-type") || "";
    bodydata = ct.includes("json")
      ? await c.req.json()
      : await c.req.parseBody();
  } catch (e: any) {}

  return {
    system: {
      headers: header_ctx,
      cookies: cookie_ctx,
      ip: getIp(header_ctx),
      location: getLocation(header_ctx),
    },
    type: String(bodydata?.type || ""),
    data: bodydata?.data || {},
  };
}

/**
 * @function ActionResponse
 * @description Constructs a Hono Response using the context object.
 * @param {any} c - The Hono Context object (c).
 * @param {any} requestdata - The response configuration from Seishiro.
 * @returns {any} The Hono response object.
 */
export function ActionResponse(c: any, requestdata: any) {
  if (requestdata.redirect) {
    return c.redirect(requestdata.redirect);
  }

  // Set Headers
  if (Array.isArray(requestdata.header)) {
    requestdata.header.forEach((h: any) => {
      if (h.key && h.value) c.header(h.key, h.value);
    });
  }

  // Set Cookies (Note: requires Hono cookie middleware for advanced options)
  if (Array.isArray(requestdata.set_cookie)) {
    requestdata.set_cookie.forEach((cookie: any) => {
      if (cookie.key && cookie.value) {
        // Fallback to manual header if setCookie helper isn't available
        c.header("Set-Cookie", `${cookie.key}=${cookie.value}`, {
          append: true,
        });
      }
    });
  }

  return c.json(requestdata.response || {}, requestdata.status || 200);
}
