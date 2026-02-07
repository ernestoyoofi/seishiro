import type {
  RegistryKey,
  RegistryFunction,
  RegistryLogic,
  RegistryMiddleware,
} from "../types/registry.type";
import formatKey from "../helper/format-key";

/**
 * @name RegistryBuilder
 */
export default class RegistryBuilder {
  private registry_logic: RegistryLogic = {};

  constructor() {
    this.registry_logic = {};
  }

  /**
   * @name set
   * @param key RegistryKey
   * @param function_regis RegistryFunction
   * @param middleware RegistryMiddleware
   */
  set(
    key: RegistryKey,
    function_regis: RegistryFunction,
    middleware?: RegistryMiddleware,
  ): void {
    const keyStr = formatKey(key);

    if (typeof function_regis !== "function") {
      throw new Error("Registry function is only type function!");
    }
    if (typeof key !== "string") {
      throw new Error("Registry key is only type string!");
    }

    if (!!middleware && typeof middleware === "function") {
      this.registry_logic[keyStr] = [middleware, function_regis];
    } else {
      this.registry_logic[keyStr] = function_regis;
    }
  }

  /**
   * @name get
   * @param key string
   */
  get(
    key: RegistryKey,
  ): RegistryFunction | [RegistryMiddleware, RegistryFunction] | undefined {
    const keyStr = formatKey(key);
    return this.registry_logic[keyStr] || undefined;
  }

  /**
   * @name apply
   */
  apply(): RegistryLogic {
    return this.registry_logic;
  }

  /**
   * @name use
   * @param input RegistryBuilder | RegistryLogic
   */
  use(input: RegistryBuilder | RegistryLogic): void {
    const logic =
      input instanceof RegistryBuilder ? input.registry_logic : input;

    if (typeof logic === "object" && logic !== null) {
      Object.entries(logic).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          const [middleware, func] = val;
          this.set(key, func, middleware);
        } else if (typeof val === "function") {
          this.set(key, val);
        }
      });
    } else {
      throw new Error(
        'The "use" input must be a RegistryBuilder or mapping object!',
      );
    }
  }
}
