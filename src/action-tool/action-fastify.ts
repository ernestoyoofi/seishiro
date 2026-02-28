/**
 * @function ActionRequest
 * @description Processes a Fastify Request object to extract system metadata,
 * authentication context (headers/cookies), and the payload (type/data).
 * @param {any} req - The Fastify Request object (req).
 * @returns {Object} A formatted object containing system context and business data.
 */
import { mapHeaders, getIp, getLocation } from "../utils/system-helpers.js";

export function ActionRequest(req: any) {
  const h_ctx = mapHeaders(req.headers);
  const cookie_ctx: Record<string, string> = {};
  if (req.cookies) {
    Object.entries(req.cookies).forEach(
      ([k, v]) => (cookie_ctx[k] = String(v).trim()),
    );
  }

  const bodydata = req.body || {};

  return {
    system: {
      headers: h_ctx,
      cookies: cookie_ctx,
      ip: getIp(h_ctx, req.ip),
      location: getLocation(h_ctx),
    },
    type: String(bodydata?.type || ""),
    data: bodydata?.data || {},
  };
}

/**
 * @function ActionResponse
 * @description Constructs a Fastify Response using the reply object.
 * @param {any} reply - The Fastify Reply object (reply).
 * @param {any} requestdata - The response configuration from Seishiro.
 * @returns {any} The Fastify reply object.
 */
export function ActionResponse(reply: any, requestdata: any) {
  if (requestdata.redirect) {
    return reply.redirect(requestdata.redirect);
  }

  if (Array.isArray(requestdata.header)) {
    requestdata.header.forEach((h: any) => {
      if (h.key && h.value) reply.header(h.key, h.value);
    });
  }

  if (Array.isArray(requestdata.set_cookie)) {
    requestdata.set_cookie.forEach((c: any) => {
      if (c.key && c.value && typeof reply.setCookie === "function") {
        reply.setCookie(c.key, c.value, c.options || {});
      } else if (c.key && c.value) {
        reply.header("Set-Cookie", `${c.key}=${c.value}`, { append: true });
      }
    });
  }

  if (Array.isArray(requestdata.rm_cookie)) {
    requestdata.rm_cookie.forEach((c: any) => {
      const key = typeof c === "string" ? c : c?.key;
      if (key && typeof reply.clearCookie === "function") {
        reply.clearCookie(key);
      }
    });
  }

  return reply.code(requestdata.status || 200).send(requestdata.response || {});
}
