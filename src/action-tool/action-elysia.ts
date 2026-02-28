/**
 * @function ActionRequest
 * @description Processes an Elysia Context object to extract system metadata,
 * authentication context (headers/cookies), and the payload (type/data).
 * @param {any} ctx - The Elysia Context object (ctx).
 * @returns {Promise<Object>} A formatted object containing system context and business data.
 */
import { mapHeaders, getIp, getLocation } from "../utils/system-helpers.js";

export async function ActionRequest(ctx: any) {
  const h_ctx = mapHeaders(ctx.request.headers);
  const cookie_ctx: Record<string, string> = {};
  if (ctx.cookie) {
    Object.entries(ctx.cookie).forEach(
      ([k, v]: [string, any]) => (cookie_ctx[k] = String(v.value).trim()),
    );
  }

  const bodydata = ctx.body || {};

  return {
    system: {
      headers: h_ctx,
      cookies: cookie_ctx,
      ip: getIp(h_ctx, ctx.request.headers.get("x-real-ip")),
      location: getLocation(h_ctx),
    },
    type: String(bodydata?.type || ""),
    data: bodydata?.data || {},
  };
}

/**
 * @function ActionResponse
 * @description Constructs an Elysia response using the context (set) object.
 * @param {any} set - The Elysia set object (set).
 * @param {any} requestdata - The response configuration from Seishiro.
 * @returns {any} The JSON response object.
 */
export function ActionResponse(set: any, requestdata: any) {
  if (requestdata.redirect) {
    set.redirect = requestdata.redirect;
    return;
  }

  if (Array.isArray(requestdata.header)) {
    requestdata.header.forEach((h: any) => {
      if (h.key && h.value) set.headers[h.key] = h.value;
    });
  }

  set.status = requestdata.status || 200;
  return requestdata.response || {};
}
