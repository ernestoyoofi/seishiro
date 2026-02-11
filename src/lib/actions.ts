import { RegistryParams } from "../types/registry.type";
import RegistryBuilder from "./registry";
import MessageBuilder from "./message";
import PolicyBuilder from "./policy";
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
  }: {
    registry: RegistryBuilder;
    message: MessageBuilder;
    policy: PolicyBuilder;
  }) {
    this.registry = registry;
    this.message = message;
    this.policy = policy;
  }

  /**
   * @method BookRegistry
   * @description Generates an encrypted list of available API registries and application versions.
   * This is used to securely expose allowed actions to the client side.
   * @returns {Object} An object containing encryption metadata (iv, type_base) and the encrypted 'data' string.
   */
  BookRegistry() {
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
    return {
      iv_length: ivLength,
      type_base: type_base,
      iv: ivKey.toString(type_base),
      data: results.toString(type_base),
    };
  }

  /**
   * @method ResponseBuilder
   * @private
   * @description Standardizes the response structure for all action types, handling headers, cookies, and errors.
   * @param {any} dataRes - The raw result or error object from the controller/middleware.
   * @param {RegistryParams["system"]} system - The system context (headers, cookies, ip, etc.) from the request.
   * @returns {Object} A unified response object containing headers, cookies, status code, and the final data/error payload.
   */
  private ResponseBuilder(dataRes: any = {}, system: RegistryParams["system"]) {
    const responseStatus =
      !dataRes.data ||
      !!dataRes.error ||
      !dataRes ||
      typeof dataRes !== "object" ||
      !!Array.isArray(dataRes)
        ? dataRes.status || 400
        : dataRes.status || 200;
    const setHeaders =
      typeof dataRes.headers === "object" && !Array.isArray(dataRes.headers)
        ? Object.entries(dataRes.headers).map(([key, value]) => {
            return {
              key: key,
              value: value,
            };
          })
        : [];
    const setCookie = Array.isArray(dataRes.set_cookie)
      ? (dataRes.set_cookie || []).filter(
          (a: any) =>
            typeof a === "object" && !Array.isArray(a) && a.key && a.value,
        )
      : [];
    const rmCookie = Array.isArray(dataRes.rm_cookie)
      ? (dataRes.rm_cookie || []).filter(
          (a: any) => typeof a === "object" && !Array.isArray(a) && a.key,
        )
      : [];
    const redirect = dataRes.redirect || null;

    if (
      !dataRes.data ||
      !!dataRes.error ||
      !dataRes ||
      typeof dataRes !== "object" ||
      !!Array.isArray(dataRes)
    ) {
      const buildingMessage = this.message.error(
        dataRes.error || "system:no-response-sending",
        [],
      );
      return {
        header: setHeaders,
        set_cookie: setCookie,
        rm_cookie: rmCookie,
        status: responseStatus,
        redirect: redirect,
        error: dataRes.error || "system:no-response-sending",
        response: {
          status: responseStatus,
          message: buildingMessage.message,
          protocol: buildingMessage.protocol,
          context: buildingMessage.context,
          params: buildingMessage.params,
        },
      };
    }

    return {
      header: setHeaders,
      set_cookie: setCookie,
      rm_cookie: rmCookie,
      status: responseStatus,
      redirect: redirect,
      error: null,
      response: {
        status: responseStatus,
        data: dataRes.data || {},
      },
    };
  }

  /**
   * @method SystemAction
   * @description The core execution engine that processes controllers and middlewares.
   * @param {RegistryParams} params - The request payload containing system info, type, data, and optional middleware state.
   * @returns {Promise<Object>} A promise that resolves to a standardized response object via ResponseBuilder.
   */
  async SystemAction({ system, middleware = {}, type, data }: RegistryParams) {
    try {
      const showregistry = this.registry;
      const getregistry = showregistry.get(type || "");
      if (!getregistry) {
        return this.ResponseBuilder(
          {
            error: "system:no-registry",
            status: 404,
          },
          system,
        );
      }
      if (Array.isArray(getregistry)) {
        const middlewareExecuted = await getregistry[0]({
          system,
          middleware,
          type,
          data,
        });
        const responsesMiddleware = this.ResponseBuilder(
          middlewareExecuted,
          system,
        );
        const executedResponse = await getregistry[1]({
          system,
          middleware: responsesMiddleware,
          type,
          data,
        });
        return this.ResponseBuilder(executedResponse, system);
      }
      const executedResponse = await getregistry({
        system,
        middleware,
        type,
        data,
      });
      return this.ResponseBuilder(executedResponse, system);
    } catch (error) {
      return this.ResponseBuilder(
        {
          error: "system:internal-server-error",
          status: 500,
        },
        system,
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
      return this.ResponseBuilder(
        {
          error: "system:no-registry",
          status: 404,
        },
        system,
      );
    }
    return this.SystemAction({ system, middleware, type, data });
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
      return this.ResponseBuilder(
        {
          error: "system:no-registry",
          status: 404,
        },
        system,
      );
    }
    return this.SystemAction({ system, middleware, type, data });
  }
}
