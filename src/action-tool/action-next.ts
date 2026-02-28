/**
 * @function ActionRequest
 * @description Processes a Next.js Request object to extract system metadata,
 * authentication context (headers/cookies), and the payload (type/data).
 * Optimized for Next.js 15+ Server Actions and Route Handlers.
 * @param {Request} req - The incoming Next.js Request object.
 * @returns {Promise<Object>} A formatted object containing system context and business data.
 */
import { mapHeaders, getIp, getLocation } from "../utils/system-helpers.js";

export async function ActionRequest(req: Request) {
  // @ts-ignore
  const { headers, cookies } = (await import("next/headers")) as any;
  // @ts-ignore
  const { ipAddress } = (await import("@vercel/functions")) as any;

  const header = await headers();
  const cookie = await cookies();
  const h_ctx = mapHeaders(header);

  const ip = getIp(
    h_ctx,
    typeof ipAddress === "function"
      ? ipAddress({ headers: header })
      : undefined,
  );
  const locationString = getLocation(h_ctx);

  // Parse Body (JSON / Form / URL-Encoded)
  const contentType = header.get("content-type") || "";
  let bodydata: any = { type: "", data: {} };

  try {
    if (contentType.includes("application/json")) {
      bodydata = await req.json();
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();
      const nested: any = {};

      for (const [key, value] of formData.entries()) {
        const keys = key.split(".");
        let current = nested;

        for (let i = 0; i < keys.length; i++) {
          const part = keys[i];
          if (i === keys.length - 1) {
            if (value instanceof Blob) {
              const arrayBuffer = await value.arrayBuffer();
              current[part] = Buffer.from(arrayBuffer);
            } else {
              current[part] = value;
            }
          } else {
            current[part] = current[part] || {};
            current = current[part];
          }
        }
      }
      bodydata = nested;
    }
  } catch (e: any) {
    console.error("[Seishiro ActionRequest]: Body parsing failed:", e.message);
  }

  // Map cookies to a clean record
  const cookie_ctx: Record<string, string> = {};
  const allCookies = cookie.getAll();
  if (Array.isArray(allCookies)) {
    for (const item of allCookies) {
      cookie_ctx[item.name] = String(item.value).trim();
    }
  }

  return {
    system: {
      headers: h_ctx,
      cookies: cookie_ctx,
      ip: ip,
      location: locationString,
    },
    type: String(bodydata?.type || ""),
    data: bodydata?.data || {},
  };
}

/**
 * @function ActionResponse
 * @description Constructs a Next.js Response object, handling redirects,
 * response data, custom headers, and cookie management.
 * @param {Request} req - The original Request object (used for absolute URL redirects).
 * @param {any} requestdata - The response configuration from Seishiro.
 * @returns {Promise<Response>} A Next.js NextResponse object.
 */
export async function ActionResponse(req: Request, requestdata: any) {
  // @ts-ignore
  const { NextResponse } = (await import("next/server")) as any;

  if (!!requestdata?.redirect) {
    return NextResponse.redirect(new URL(requestdata.redirect, req.url));
  }

  const responses = NextResponse.json(requestdata.response || {}, {
    status: requestdata.status || 200,
  });

  if (Array.isArray(requestdata.header)) {
    requestdata.header.forEach((h: any) => {
      if (h.key && h.value) responses.headers.set(h.key, h.value);
    });
  }

  if (Array.isArray(requestdata.set_cookie)) {
    requestdata.set_cookie.forEach((c: any) => {
      if (c.key && c.value)
        responses.cookies.set(c.key, c.value, c.options || {});
    });
  }

  if (Array.isArray(requestdata.rm_cookie)) {
    requestdata.rm_cookie.forEach((c: any) => {
      const key = typeof c === "string" ? c : c?.key;
      if (key) responses.cookies.delete(key);
    });
  }

  return responses;
}
