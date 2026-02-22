import {
  PolicyPassKey,
  PolicyVersionNow,
  PolicyVersionMin,
  PolicyVersionForceUpdate,
  PolicyNoActionAPIAction,
  PolicyNoActionServerAction,
  PolicyNoActionKey,
  PolicyNoActionBase,
} from "../types/policy.type.js";

/**
 * @class PolicyBuilder
 * @description Manages application policies including security passkeys, version control,
 * and protocol-specific action restrictions (Gatekeeping).
 */
export default class PolicyBuilder {
  private passkey: PolicyPassKey;
  private version_now: PolicyVersionNow;
  private version_min: PolicyVersionMin;
  private version_forceupdate: PolicyVersionForceUpdate;
  private noaction_api: PolicyNoActionAPIAction;
  private noaction_server: PolicyNoActionServerAction;
  private compiled_policy: any = null;
  private skip_middleware_context: boolean;
  private parsed_min: number[];
  private parsed_now: number[];

  /**
   * @constructor
   * @param {Object} config - The policy configuration.
   * @param {string} config.passkey - Secret key used for registry encryption (SHA-256).
   * @param {string} config.version_now - The current stable version of the application.
   * @param {string} config.version_min - The minimum required version for clients to operate.
   * @param {boolean} [config.version_forceupdate=true] - Flag to indicate if clients below version_min must update.
   * @throws {Error} If passkey, version_now, or version_min is missing.
   */
  constructor({
    passkey,
    version_now,
    version_min,
    version_forceupdate = true,
    skip_middleware_context = false,
  }: {
    passkey: string;
    version_now: string;
    version_min: string;
    version_forceupdate?: boolean;
    skip_middleware_context?: boolean;
  }) {
    if (!passkey || !version_now || !version_min) {
      throw new Error(
        "PolicyBuilder: passkey, version_now, and version_min are required!",
      );
    }
    this.passkey = passkey;
    this.version_now = version_now;
    this.version_min = version_min;
    this.parsed_min = this.parseVersion(version_min);
    this.parsed_now = this.parseVersion(version_now);
    this.version_forceupdate = version_forceupdate;
    this.noaction_api = [];
    this.noaction_server = [];
    this.skip_middleware_context = skip_middleware_context;
    this.refresh();
  }

  /**
   * @method noaction
   * @description Restricts specific action types from being accessed via certain protocols.
   * @param {PolicyNoActionKey} [type=""] - The registry key/action type to restrict.
   * @param {PolicyNoActionBase} [action=[]] - Array of protocols to block ('server-action' or 'api-action').
   * @throws {Error} If the protocol type is invalid or the key is not a string.
   */
  noaction(type: PolicyNoActionKey = "", action: PolicyNoActionBase = []) {
    const onlyAllowed = ["server-action", "api-action"];
    for (let actionRes of action) {
      if (!onlyAllowed.includes(actionRes)) {
        throw new Error(
          `Invalid action type: ${actionRes}. Only allowed actions are: ${onlyAllowed.join(", ")}`,
        );
      }
    }
    if (typeof type !== "string") {
      throw new Error(`Invalid key type, it only string!`);
    }
    for (let actionRes of action) {
      if (actionRes === "api-action") {
        this.noaction_api.push(type);
      } else if (actionRes === "server-action") {
        this.noaction_server.push(type);
      }
    }
  }

  private parseVersion(v: string): number[] {
    return v.split(".").map(Number);
  }

  private compare(v1: number[], v2: number[]): number {
    const len = Math.max(v1.length, v2.length);
    for (let i = 0; i < len; i++) {
      const n1 = v1[i] || 0;
      const n2 = v2[i] || 0;
      if (n1 !== n2) return n1 > n2 ? 1 : -1;
    }
    return 0;
  }

  /**
   * @method version_info
   * @description Checks a provided version against the minimum and current version requirements.
   * @param {string} [version=""] - The version string to validate (usually from the client).
   * @returns {Object} An object containing upgrade flags and version compatibility status.
   */
  version_info(clientVersion: string = "") {
    const vClient = this.parseVersion(clientVersion);
    return {
      info_upgrade: this.version_forceupdate,
      is_version_min: this.compare(vClient, this.parsed_min) >= 0,
      is_version_now: this.compare(vClient, this.parsed_now) >= 0,
    };
  }

  /**
   * @method refresh
   * @description Refreshes the compiled policy.
   */
  private refresh() {
    this.compiled_policy = {
      passkey: this.passkey,
      version_now: this.version_now,
      version_min: this.version_min,
      version_forceupdate: this.version_forceupdate,
      noaction_api: this.noaction_api,
      noaction_server: this.noaction_server,
      skip_middleware_context: this.skip_middleware_context,
    };
  }

  /**
   * @method apply
   * @description Retrieves the compiled policy configuration.
   * @returns {Object} All policy settings including restricted actions and versioning data.
   */
  apply() {
    return this.compiled_policy;
  }
}
