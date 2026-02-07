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
 * @name PolicyBuilder
 */
export default class PolicyBuilder {
  private passkey: PolicyPassKey;
  private version_now: PolicyVersionNow;
  private version_min: PolicyVersionMin;
  private version_forceupdate: PolicyVersionForceUpdate;
  private noaction_api: PolicyNoActionAPIAction;
  private noaction_server: PolicyNoActionServerAction;

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
