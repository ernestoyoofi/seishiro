// Message Key
export type MessageKey = string;
export type MessageLang = string | "en" | "id";
// Message Value
export type MessageValue = string;
// Message Error Context
export type MessageErrorContext = string;
// Message Error Context Slug
export type MessageErrorContextSlug = string;
// Message Error Context Options
export type MessageErrorContextOpt = Record<string, string>;
// Message Error Context Tracker ID
export type MessageErrorContextTrack = string;
// Message Logic Language
export type MessageLogicLang = Map<MessageLang, Map<MessageKey, MessageValue>>;
// Message Logic
export type MessageLogic = Record<MessageKey, MessageValue>;
// Message Error Context
