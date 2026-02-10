import type {
  MessageKey,
  MessageValue,
  MessageLang,
  MessageLogic,
  MessageLogicLang,
  MessageErrorContext,
  MessageErrorContextOpt,
  MessageErrorContextSlug,
} from "../types/message.type";
import formatKey from "../utils/format-key";
import { DefaultLanguage } from "../constants/message";

/**
 * @class MessageBuilder
 * @description Handles multi-language response messages, error formatting, and dynamic template replacement.
 * It allows the application to return consistent, localized messages across different platforms.
 */
export default class MessageBuilder {
  private message_build_lang: MessageLang = "";
  private message_logic: MessageLogicLang = {};

  /**
   * @constructor
   * @param {MessageLang} [language="en"] - The default language code (e.g., 'en', 'id').
   * It will be sanitized to a 2-character lowercase string.
   */
  constructor(language: MessageLang = "en") {
    this.message_build_lang = String(language || "en")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 2);
    this.message_logic = {};
  }

  /**
   * @method set
   * @description Registers a specific message template for the current active language.
   * @param {MessageKey} key - The unique identifier for the message.
   * @param {MessageValue} value - The message string (supports {{variable}} placeholders).
   * @throws {Error} If key or value is not a string.
   */
  set(key: MessageKey, value: MessageValue): void {
    const keyStr = formatKey(key);

    if (typeof value !== "string") {
      throw new Error("Message value is only type string!");
    }
    if (typeof key !== "string") {
      throw new Error("Message key is only type string!");
    }

    if (!this.message_logic[this.message_build_lang]) {
      this.message_logic[this.message_build_lang] = {};
    }

    this.message_logic[this.message_build_lang][keyStr] = String(value).trim();
  }

  /**
   * @method get
   * @description Retrieves a raw message template based on the key and language.
   * Falls back to the default language if the requested language is not found.
   * @param {MessageKey} [key=""] - The message identifier to look up.
   * @param {MessageLang} [lang=this.message_build_lang] - Optional language override.
   * @returns {MessageValue} The raw message string or a fallback indicator if not found.
   */
  get(
    key: MessageKey = "",
    lang: MessageLang = this.message_build_lang,
  ): MessageValue {
    const keyStr = formatKey(key);
    let langSupport: MessageLang = lang;

    // Not Language On Logic
    if (!this.message_logic[langSupport]) {
      console.warn(
        "[Debugging Message]: Language not found on logic, using default language!",
      );
      if (this.message_logic[DefaultLanguage]) {
        langSupport = DefaultLanguage;
      } else {
        langSupport = Object.keys(this.message_logic || {})[0];
      }
    }

    if (!this.message_logic[langSupport]) {
      console.warn(
        "[Debugging Message]: Language or variable not found on logic!",
      );
      return String(`[!NoneVariable ${keyStr}]`);
    }

    // Return
    return String(this.message_logic[langSupport][keyStr] || "").trim();
  }

  /**
   * @method errorMessage
   * @description Processes a template by replacing {{key}} placeholders with actual values.
   * @param {MessageErrorContextSlug} [errorSlug=""] - The message key/slug.
   * @param {MessageErrorContextOpt} [errorOpt={}] - Object containing key-value pairs for replacement.
   * @param {MessageLang} [lang=this.message_build_lang] - The language to use.
   * @returns {string} The fully formatted message string.
   */
  errorMessage(
    errorSlug: MessageErrorContextSlug = "",
    errorOpt: MessageErrorContextOpt = {},
    lang: MessageLang = this.message_build_lang,
  ): string {
    let messageContext: string = this.get(errorSlug, lang);

    Object.keys(errorOpt || {}).forEach((keys: string) => {
      const values = (errorOpt as Record<string, string>)[keys] || "";
      const pattern = new RegExp(`{{${keys}}}`, "g");
      messageContext = messageContext.replace(pattern, values);
    });

    return messageContext;
  }

  /**
   * @method error
   * @description Parses a complex error string (protocol:slug|slug) and returns a structured error object.
   * @param {MessageErrorContext} [errorStr=""] - The raw error string (e.g., "auth:user-not-found").
   * @param {MessageErrorContextOpt[]} [errorOpts=[]] - Array of option objects for multiple slugs.
   * @param {MessageLang} [lang=this.message_build_lang] - The target language.
   * @returns {Object} Structured error containing protocol, context array, params, and the final joined message.
   */
  error(
    errorStr: MessageErrorContext = "",
    errorOpts: MessageErrorContextOpt[] = [],
    lang: MessageLang = this.message_build_lang,
  ) {
    const [protocol, ...messages] = String(errorStr || "").split(":");
    const messageContext = String(messages.join(":")).split("|");

    const messageArrayCtx = messageContext
      .map((errorSlug, key) => {
        const getOpt = errorOpts[key];
        return this.errorMessage(errorSlug, getOpt, lang);
      })
      .join(", ");

    return {
      protocol: formatKey(protocol),
      context: messageContext,
      params: errorOpts,
      message: messageArrayCtx,
    };
  }

  /**
   * @method apply
   * @description Returns the entire compiled message logic object.
   * @returns {MessageLogicLang} The internal storage of languages and their messages.
   */
  apply(): MessageLogicLang {
    return this.message_logic;
  }

  /**
   * @method use
   * @description Merges messages from another MessageBuilder instance or a plain object into the current one.
   * @param {MessageBuilder | MessageLogic} input - The source of new messages.
   * @throws {Error} If the input type is invalid.
   */
  use(input: MessageBuilder | MessageLogic): void {
    if (input instanceof MessageBuilder) {
      const otherLogic = input.apply();
      for (const lang in otherLogic) {
        if (Object.prototype.hasOwnProperty.call(otherLogic, lang)) {
          const messages = otherLogic[lang];
          if (!this.message_logic[lang]) {
            this.message_logic[lang] = {};
          }
          Object.assign(this.message_logic[lang], messages);
        }
      }
    } else if (typeof input === "object" && input !== null) {
      for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
          this.set(
            key as MessageKey,
            (input as MessageLogic)[key] as MessageValue,
          );
        }
      }
    } else {
      throw new Error(
        'The "use" input must be a MessageBuilder or mapping object!',
      );
    }
  }
}
