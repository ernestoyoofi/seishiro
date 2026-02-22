import type {
  MessageKey,
  MessageValue,
  MessageLang,
  MessageLogic,
  MessageLogicLang,
  MessageErrorContext,
  MessageErrorContextOpt,
  MessageErrorContextSlug,
} from "../types/message.type.js";
import formatKey from "../utils/format-key.js";
import { DefaultLanguage } from "../constants/message.js";

/**
 * @class MessageBuilder
 * @description Handles multi-language response messages, error formatting, and dynamic template replacement.
 * It allows the application to return consistent, localized messages across different platforms.
 */
export default class MessageBuilder {
  private message_build_lang: MessageLang = "";
  private message_logic: MessageLogicLang = new Map();

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
    this.message_logic = new Map();
  }

  /**
   * @method set
   * @description Registers a specific message template for the current active language.
   * @param {MessageKey} key - The unique identifier for the message.
   * @param {MessageValue} value - The message string (supports {{variable}} placeholders).
   * @throws {Error} If key or value is not a string.
   */
  set(key: MessageKey, value: MessageValue): void {
    if (typeof value !== "string" || typeof key !== "string") {
      throw new Error("Key and Value must be string!");
    }

    const keyStr = formatKey(key);

    if (!this.message_logic.has(this.message_build_lang)) {
      this.message_logic.set(this.message_build_lang, new Map());
    }

    this.message_logic.get(this.message_build_lang)!.set(keyStr, value.trim());
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
    let langMap = this.message_logic.get(lang);

    if (!langMap) {
      langMap = this.message_logic.get(DefaultLanguage);
      if (!langMap && this.message_logic.size > 0) {
        langMap = this.message_logic.values().next().value;
      }
    }

    if (!langMap) return `[!NoneVariable ${keyStr}]`;

    return langMap.get(keyStr) || "";
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
    const messageContext = this.get(errorSlug, lang);

    if (!errorOpt || Object.keys(errorOpt).length === 0) {
      return messageContext;
    }

    return messageContext.replace(/{{(\w+)}}/g, (match, key) => {
      return errorOpt[key] || match;
    });
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
    const delimiterIndex = errorStr.indexOf(":");
    if (delimiterIndex === -1) {
      return {
        protocol: "unknown",
        context: [errorStr],
        params: errorOpts,
        message: errorStr,
      };
    }

    const protocol = formatKey(errorStr.substring(0, delimiterIndex));
    const messageContext = errorStr.substring(delimiterIndex + 1).split("|");

    let finalMessage = "";
    for (let i = 0; i < messageContext.length; i++) {
      const translated = this.errorMessage(
        messageContext[i],
        errorOpts[i],
        lang,
      );
      finalMessage += (i === 0 ? "" : ", ") + translated;
    }

    return {
      protocol,
      context: messageContext,
      params: errorOpts,
      message: finalMessage,
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
      otherLogic.forEach((messages, lang) => {
        let currentMessages = this.message_logic.get(lang);
        if (!currentMessages) {
          currentMessages = new Map();
          this.message_logic.set(lang, currentMessages);
        }
        messages.forEach((value, key) => {
          currentMessages!.set(key, value);
        });
      });
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
