/**
 * @function ActionRequest
 * @description Processes an Express.js Request object to extract system metadata,
 * authentication context (headers/cookies), and the payload (type/data).
 * @param {any} req - The Express.js Request object (req).
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
      ip: getIp(h_ctx, req.ip || req.connection?.remoteAddress),
      location: getLocation(h_ctx),
    },
    type: String(bodydata?.type || ""),
    data: bodydata?.data || {},
  };
}

/**
 * @function ActionResponse
 * @description Constructs an Express.js Response object, handling redirects,
 * response data, custom headers, and cookie management.
 * @param {any} res - The Express.js Response object (res).
 * @param {any} requestdata - The response configuration from Seishiro.
 * @returns {any} The Express response object.
 */
export function ActionResponse(res: any, requestdata: any) {
  if (requestdata.redirect) {
    return res.redirect(requestdata.redirect);
  }

  res.status(requestdata.status || 200);

  if (Array.isArray(requestdata.header)) {
    requestdata.header.forEach((h: any) => {
      if (h.key && h.value) res.set(h.key, h.value);
    });
  }

  if (Array.isArray(requestdata.set_cookie)) {
    requestdata.set_cookie.forEach((c: any) => {
      if (c.key && c.value) res.cookie(c.key, c.value, c.options || {});
    });
  }

  if (Array.isArray(requestdata.rm_cookie)) {
    requestdata.rm_cookie.forEach((c: any) => {
      const key = typeof c === "string" ? c : c?.key;
      if (key) res.clearCookie(key);
    });
  }

  return res.json(requestdata.response || {});
}
