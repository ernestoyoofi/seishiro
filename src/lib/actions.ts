import { RegistryParams } from "../types/registry.type.js";
import RegistryBuilder from "./registry.js";
import MessageBuilder from "./message.js";
import PolicyBuilder from "./policy.js";
import extractLanguage from "../utils/extract-lang.js";
import { cacheBookType } from "../types/actions.types.js";
import crypto from "crypto";
import { Buffer } from "buffer";

/**
 * @class Actions
 * @description The main orchestrator of the Seishiro API. It handles the execution flow
 * by coordinating between Registry, Message, and Policy builders across different protocols.
 */
export default class Actions {
  private registry: RegistryBuilder;
  private message: MessageBuilder;
  private policy: PolicyBuilder;
  private heading: { version: string; lang: string };
  private cache_book: cacheBookType;

  /**
   * @constructor
   * @param {Object} params - Configuration instances.
   * @param {RegistryBuilder} params.registry - Instance to manage route/controller mapping.
   * @param {MessageBuilder} params.message - Instance to handle localized error/response messages.
   * @param {PolicyBuilder} params.policy - Instance to manage security and versioning rules.
   */
  constructor({
    registry,
    message,
    policy,
    heading = {
      version: "x-seishiro-client",
      lang: "x-seishiro-lang",
    },
  }: {
    registry: RegistryBuilder;
    message: MessageBuilder;
    policy: PolicyBuilder;
    heading?: { version: string; lang: string };
  }) {
    this.registry = registry;
    this.message = message;
    this.policy = policy;
    this.heading = heading;
    this.cache_book = null;
  }

  /**
   * @method BookRegistry
   * @description Generates an encrypted list of available API registries and application versions.
   * This is used to securely expose allowed actions to the client side.
   * @returns {Object} An object containing encryption metadata (iv, type_base) and the encrypted "data" string.
   */
  BookRegistry() {
    // Have Cache
    if (this.cache_book) {
      return this.cache_book;
    }
    // Default Configuration
    const algorithm = "aes-256-ctr";
    const type_base = "hex";
    const ivLength = 16;
    const ivKey = crypto.randomBytes(ivLength);
    // Dynamic Info
    const policyInfo = this.policy.apply();
    const registry = this.registry.apply();
    const keyencrypt = crypto
      .createHash("sha256")
      .update(String(policyInfo.passkey || "").trim())
      .digest();
    // Data List
    const buildRegistry = {
      listkey: Object.keys(registry).filter(
        (a) => !policyInfo.noaction_api.includes(a),
      ),
      version_now: policyInfo.version_now,
      version_min: policyInfo.version_min,
      version_forceupdate: policyInfo.version_forceupdate,
    };
    // Create Encrypted Data
    const cipher = crypto.createCipheriv(algorithm, keyencrypt, ivKey);
    const results = Buffer.concat([
      ivKey,
      cipher.update(JSON.stringify(buildRegistry), "utf-8"),
      cipher.final(),
    ]);
    const buildCache = {
      iv_length: ivLength,
      type_base: type_base,
      iv: ivKey.toString(type_base),
      data: results.toString(type_base),
    };
    this.cache_book = buildCache;
    return buildCache;
  }

  /**
   * @method ResponseBuilder
   * @private
   * @description Standardizes the response structure for all action types, handling headers, cookies, and errors.
   * @param {any} dataRes - The raw result or error object from the controller/middleware.
   * @param {RegistryParams["system"]} system - The system context (headers, cookies, ip, etc.) from the request.
   * @returns {Object} A unified response object containing headers, cookies, status code, and the final data/error payload.
   */
  private ResponseBuilder(
    dataRes: any = {},
    system: RegistryParams["system"],
    lang: string = "en",
  ) {
    const isError =
      !dataRes ||
      typeof dataRes !== "object" ||
      Array.isArray(dataRes) ||
      !!dataRes.error ||
      !dataRes.data;
    const status = dataRes?.status || (isError ? 400 : 200);

    const header = Object.entries(dataRes?.headers || {})
      .filter(([_, v]) => v !== undefined)
      .map(([key, value]) => ({ key, value }));

    const set_cookie = (
      Array.isArray(dataRes?.set_cookie) ? dataRes.set_cookie : []
    ).filter((c: any) => c?.key && c?.value);

    const rm_cookie = (
      Array.isArray(dataRes?.rm_cookie) ? dataRes.rm_cookie : []
    ).filter((c: any) => typeof c === "string" || c?.key);

    const base = {
      header,
      set_cookie,
      rm_cookie,
      status,
      redirect: dataRes?.redirect || null,
    };

    if (isError) {
      const error = dataRes?.error || "system:no-response-sending";
      const msg = this.message.error(error, dataRes?.params || [], lang);

      return {
        ...base,
        error,
        response: {
          status,
          message: msg.message,
          protocol: msg.protocol,
          context: msg.context,
          params: msg.params,
        },
      };
    }

    return {
      ...base,
      error: null,
      response: { status, data: dataRes.data || {} },
    };
  }

  /**
   * @method SystemAction
   * @description The core execution engine that processes controllers and middlewares.
   * @param {RegistryParams} params - The request payload containing system info, type, data, and optional middleware state.
   * @returns {Promise<Object>} A promise that resolves to a standardized response object via ResponseBuilder.
   */
  async SystemAction({
    system,
    middleware = {},
    context_manager = "system-action",
    type,
    data,
  }: RegistryParams) {
    const activeLang = extractLanguage(
      system?.headers?.[this.heading.lang] ||
        system?.headers?.["accept-language"] ||
        system?.lang ||
        "en",
    );

    try {
      const policyInfo = this.policy.apply();

      const clientVersion = String(
        system?.headers?.[this.heading.version] || "",
      ).trim();

      if (context_manager === "api-action" && !clientVersion) {
        return this.ResponseBuilder(
          {
            error: "system:client-version-required",
            status: 400,
          },
          system,
          activeLang,
        );
      }

      if (clientVersion && context_manager === "api-action") {
        const vInfo = this.policy.version_info(clientVersion);

        if (!vInfo.is_version_min && vInfo.info_upgrade) {
          return this.ResponseBuilder(
            {
              error: "system:need-upgrade-client",
              status: 426,
              params: [
                { min: policyInfo.version_min, now: policyInfo.version_now },
              ],
            },
            system,
            activeLang,
          );
        }
      }

      const handler = this.registry.get(type || "");
      if (!handler) {
        return this.ResponseBuilder(
          { error: "system:no-registry", status: 404 },
          system,
          activeLang,
        );
      }

      const systemWithLang = { ...system, lang: activeLang };

      let currentMiddleware = middleware;
      let finalHandler = handler;

      if (Array.isArray(handler)) {
        const [middlewareFn, controllerFn] = handler;
        const middlewares = Array.isArray(middlewareFn)
          ? middlewareFn
          : [middlewareFn];

        const middlewareResults: any[] = [];
        for (const mw of middlewares) {
          const mwResult = await mw({
            system: systemWithLang,
            middleware: middlewareResults,
            type,
            data,
          });

          if (!!mwResult?.error && policyInfo.catch_middleware_context) {
            return this.ResponseBuilder(mwResult, systemWithLang, activeLang);
          }

          middlewareResults.push(mwResult);
        }

        currentMiddleware = middlewareResults;
        finalHandler = controllerFn;
      }

      const executedResponse = await (finalHandler as Function)({
        system: systemWithLang,
        middleware: currentMiddleware,
        type,
        data,
      });

      return this.ResponseBuilder(executedResponse, systemWithLang, activeLang);
    } catch (error) {
      console.error("[Seishiro Core Error]:", error);
      return this.ResponseBuilder(
        { error: "system:internal-server-error", status: 500 },
        system,
        activeLang,
      );
    }
  }

  /**
   * @method ServerAction
   * @description Entry point for Server-side actions (e.g., Next.js Server Actions).
   * It checks against server-specific policies before executing.
   * @param {RegistryParams} params - The request payload.
   * @returns {Promise<Object>} The standardized response or a 404 error if the action is restricted by policy.
   */
  async ServerAction({ system, middleware, type, data }: RegistryParams) {
    if (this.policy.apply().noaction_server.includes(type || "")) {
      const lang = extractLanguage(
        system?.headers?.[this.heading.lang] ||
          system?.headers?.["accept-language"] ||
          system?.lang ||
          "en",
      );
      return this.ResponseBuilder(
        { error: "system:no-registry", status: 404 },
        system,
        lang,
      );
    }
    return this.SystemAction({
      system,
      middleware,
      context_manager: "server-action",
      type,
      data,
    });
  }

  /**
   * @method APIAction
   * @description Entry point for REST API requests.
   * It checks against API-specific policies to prevent unauthorized access to sensitive endpoints.
   * @param {RegistryParams} params - The request payload.
   * @returns {Promise<Object>} The standardized response or a 404 error if the action is restricted by policy.
   */
  async APIAction({ system, middleware, type, data }: RegistryParams) {
    if (this.policy.apply().noaction_api.includes(type || "")) {
      const lang = extractLanguage(
        system?.headers?.[this.heading.lang] ||
          system?.headers?.["accept-language"] ||
          system?.lang ||
          "en",
      );
      return this.ResponseBuilder(
        { error: "system:no-registry", status: 404 },
        system,
        lang,
      );
    }
    return this.SystemAction({
      system,
      middleware,
      context_manager: "api-action",
      type,
      data,
    });
  }
}
