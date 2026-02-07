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
import formatKey from "../helper/format-key";
import { DefaultLanguage } from "../var/message";

/**
 * @name MessageBuilder
 */
export default class MessageBuilder {
  private message_build_lang: MessageLang = "";
  private message_logic: MessageLogicLang = {};

  constructor(language: MessageLang = "en") {
    this.message_build_lang = String(language || "en")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 2);
    this.message_logic = {};
  }

  /**
   * @name use
   * @param string string
   * @param value string
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
   * @name get
   * @param key string
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

  errorMessage(
    errorSlug: MessageErrorContextSlug = "",
    errorOpt: MessageErrorContextOpt = {},
    lang: MessageLang = this.message_build_lang,
  ): string {
    let messageContext: string = this.get(errorSlug, lang);

    Object.entries(errorOpt || {}).forEach(([keys, values]) => {
      const pattern = new RegExp(`{{${keys}}}`, "g");
      messageContext = messageContext.replace(pattern, values);
    });

    return messageContext;
  }

  /**
   * @name error
   * @param errorStr string
   * @param errorOpts object[]
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
   * @name apply
   */
  apply(): MessageLogicLang {
    return this.message_logic;
  }

  /**
   * @name use
   * @param input MessageBuilder | MessageLogic
   */
  use(input: MessageBuilder | MessageLogic): void {
    if (input instanceof MessageBuilder) {
      const otherLogic = input.apply();
      Object.entries(otherLogic).forEach(([lang, messages]) => {
        if (!this.message_logic[lang]) {
          this.message_logic[lang] = {};
        }
        Object.assign(this.message_logic[lang], messages);
      });
    } else if (typeof input === "object" && input !== null) {
      Object.entries(input).forEach(([key, value]) => {
        this.set(key, value);
      });
    } else {
      throw new Error(
        'The "use" input must be a MessageBuilder or mapping object!',
      );
    }
  }
}
