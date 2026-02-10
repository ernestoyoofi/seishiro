import {
  PolicyPassKey,
  PolicyVersionNow,
  PolicyVersionMin,
  PolicyVersionForceUpdate,
  PolicyNoActionAPIAction,
  PolicyNoActionServerAction,
  PolicyNoActionKey,
  PolicyNoActionBase,
} from "../types/policy.type";

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
  }: {
    passkey: string;
    version_now: string;
    version_min: string;
    version_forceupdate?: boolean;
  }) {
    if (!passkey || !version_now || !version_min) {
      throw new Error(
        "PolicyBuilder: passkey, version_now, and version_min are required!",
      );
    }
    this.passkey = passkey;
    this.version_now = version_now;
    this.version_min = version_min;
    this.version_forceupdate = version_forceupdate;
    this.noaction_api = [];
    this.noaction_server = [];
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

  /**
   * @method compareVersions
   * @private
   * @description Compares two semantic version strings to determine their order.
   * @param {string} v1 - First version string.
   * @param {string} v2 - Second version string.
   * @returns {number} 1 if v1 > v2, -1 if v1 < v2, and 0 if they are equal.
   */
  private compareVersions(v1: string, v2: string): number {
    const clean = (v: string) => v.replace(/-.*$/, "");

    const p1 = clean(v1).split(".").map(Number);
    const p2 = clean(v2).split(".").map(Number);

    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }

  /**
   * @method version_info
   * @description Checks a provided version against the minimum and current version requirements.
   * @param {string} [version=""] - The version string to validate (usually from the client).
   * @returns {Object} An object containing upgrade flags and version compatibility status.
   */
  version_info(version: string = "") {
    const comparisonMin = this.compareVersions(version, this.version_min);
    const comparisonNow = this.compareVersions(version, this.version_now);

    const minimumVersion = comparisonMin >= 0;
    const matchWithNow = comparisonNow >= 0;

    return {
      info_upgrade: this.version_forceupdate,
      is_version_min: minimumVersion,
      is_version_now: matchWithNow,
    };
  }

  /**
   * @method apply
   * @description Retrieves the compiled policy configuration.
   * @returns {Object} All policy settings including restricted actions and versioning data.
   */
  apply() {
    return {
      passkey: this.passkey,
      version_now: this.version_now,
      version_min: this.version_min,
      version_forceupdate: this.version_forceupdate,
      noaction_api: this.noaction_api,
      noaction_server: this.noaction_server,
    };
  }
}
