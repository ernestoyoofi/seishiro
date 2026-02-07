import { RegistryParams } from "../types/registry.type";
import RegistryBuilder from "./registry";
import MessageBuilder from "./message";
import PolicyBuilder from "./policy";
import crypto from "crypto";

/**
 * @name Actions
 */
export default class Actions {
  private registry: RegistryBuilder;
  private message: MessageBuilder;
  private policy: PolicyBuilder;

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

  private ResponseBuilder(dataRes: any = {}, system: RegistryParams["system"]) {
    const responseStatus = dataRes.error
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

    if (dataRes.error || !dataRes || typeof dataRes !== "object") {
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
