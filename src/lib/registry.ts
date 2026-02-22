import type {
  RegistryKey,
  RegistryFunction,
  RegistryLogic,
  RegistryMiddleware,
} from "../types/registry.type.js";
import formatKey from "../utils/format-key.js";

/**
 * @class RegistryBuilder
 * @description Centralizes the mapping of unique action keys to their respective controllers
 * and optional middlewares. It acts as the routing table for the Seishiro API system.
 */
export default class RegistryBuilder {
  private registry_logic: RegistryLogic;

  /**
   * @constructor
   * @description Initializes an empty registry storage.
   */
  constructor() {
    this.registry_logic = new Map();
  }

  /**
   * @method set
   * @description Registers a controller and an optional middleware to a specific key.
   * If a middleware is provided, the registry will store them as an array [middleware, function].
   * @param {RegistryKey} key - The unique identifier for the action (e.g., 'user:login').
   * @param {RegistryFunction} function_regis - The main controller function to execute.
   * @param {RegistryMiddleware} [middleware] - Optional middleware function to execute before the main controller.
   * @throws {Error} If the controller is not a function or the key is not a string.
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
      this.registry_logic.set(keyStr, [middleware, function_regis]);
    } else {
      this.registry_logic.set(keyStr, function_regis);
    }
  }

  /**
   * @method get
   * @description Retrieves the registered function(s) associated with a specific key.
   * @param {RegistryKey} key - The key to look up in the registry.
   * @returns {RegistryFunction | [RegistryMiddleware, RegistryFunction] | undefined}
   * Returns a single function, an array containing [middleware, controller], or undefined if not found.
   */
  get(
    key: RegistryKey,
  ): RegistryFunction | [RegistryMiddleware, RegistryFunction] | undefined {
    const keyStr = formatKey(key);
    return this.registry_logic.get(keyStr) || undefined;
  }

  /**
   * @method apply
   * @description Returns the raw internal registry logic mapping.
   * @returns {RegistryLogic} The complete object mapping of keys to functions/middlewares.
   */
  apply(): RegistryLogic {
    return this.registry_logic;
  }

  /**
   * @method use
   * @description Merges another RegistryBuilder instance or a raw registry object into the current instance.
   * This is useful for modularizing routes across different files.
   * @param {RegistryBuilder | RegistryLogic} input - The source registry to be merged.
   * @throws {Error} If the input is not a RegistryBuilder instance or a valid mapping object.
   */
  use(input: RegistryBuilder | RegistryLogic): void {
    if (input instanceof RegistryBuilder) {
      // 5. Gabungkan Map dengan efisien
      for (const [key, val] of input.registry_logic) {
        this.registry_logic.set(key, val);
      }
    } else if (typeof input === "object" && input !== null) {
      // Loop object biasa jika inputnya POJO
      for (const [key, val] of Object.entries(input)) {
        if (Array.isArray(val)) {
          this.set(key, val[1], val[0]);
        } else if (typeof val === "function") {
          this.set(key, val);
        }
      }
    } else {
      throw new Error(
        'The "use" input must be a RegistryBuilder or mapping object!',
      );
    }
  }
}
