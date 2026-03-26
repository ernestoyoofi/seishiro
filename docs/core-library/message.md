# Message Builder

Seishiro Message Builder is a class that handles multi-language response messages, error formatting, and dynamic template replacement. It allows the application to return consistent, localized messages across different platforms.

---

The `Message` class handles multi-language response messages, error formatting, and dynamic template replacement. It allows the application to return consistent, localized messages across different platforms.

## Constructor

```typescript
constructor(language: string = "en")
```

- **`language`**: The default language code for the system (e.g., `'en'`, `'id'`). It is sanitized to a 2-character lowercase string.

## Shared Types

```typescript
type MessageKey = string;
type MessageValue = string;
type MessageLang = string | "en" | "id";
type MessageErrorContext = string; // e.g., "auth:invalid-password"
type MessageErrorContextOpt = Record<string, string>; // e.g., { user: "admin" }
```

---

## Methods & Usage

### `set(key: MessageKey, value: MessageValue): void`
Registers a specific message template for the current active language.

**Usage:**

```typescript
const messages = new Message("en");
messages.set("user-not-found", "User @{{username}} does not exist.");
messages.set("system-error", "An unexpected error occurred.");
```

---

### `get(key?: MessageKey, lang?: MessageLang): MessageValue`
Retrieves a raw message template based on the given key and language. It falls back to the default language or the first available language if the requested language mapping does not exist.

**Usage:**

```typescript
const raw = messages.get("user-not-found", "en"); 
// Returns: "User @{{username}} does not exist."
```

---

### `errorMessage(errorSlug?: string, errorOpt?: MessageErrorContextOpt, lang?: MessageLang): string`
Processes a message template by replacing its `{{key}}` placeholders with actual values provided in `errorOpt`.

**Usage:**

```typescript
const formatted = messages.errorMessage(
  "user-not-found", 
  { username: "sunaookamishiroko" }, 
  "en"
);
// Returns: "User @sunaookamishiroko does not exist."
```

---

### `error(errorStr?: MessageErrorContext, errorOpts?: MessageErrorContextOpt[], lang?: MessageLang): Object`
Parses a complex error string using a standard format (`protocol:slug|slug`) and returns a fully structured error object.

**Usage:**

```typescript
const errObj = messages.error(
  "auth:user-not-found|system-error", 
  [{ username: "sunaookamishiroko" }, {}], 
  "en"
);

/* Returns:
{
  protocol: "auth",
  context: ["user-not-found", "system-error"],
  params: [{ username: "sunaookamishiroko" }, {}],
  message: "User @sunaookamishiroko does not exist., An unexpected error occurred."
}
*/
```

---

### `apply(): Map<MessageLang, Map<MessageKey, MessageValue>>`
Returns the complete internal storage map containing all registered languages and their messages.

---

### `use(input: Message | Record<MessageKey, MessageValue>): void`
Merges messages from another `Message` instance or a plain object mapping into the current one.

**Usage:**

```typescript
// Define multiple messages at once using an object
messages.use({
  "invalid-email": "The email provided is invalid.",
  "weak-password": "Password must be at least 8 characters long."
});
```
