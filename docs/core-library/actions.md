# Actions

Seishiro Actions is a class that orchestrates the execution flow of the Seishiro API. It coordinates between the `Registry`, `Message`, and `Policy` builders across different protocols.

---

The `Actions` class is the main orchestrator of the Seishiro API. It handles the execution flow by coordinating between the `Registry`, `Message`, and `Policy` builders across different protocols.

## Constructor

```typescript
constructor({
  registry,
  message,
  policy,
  heading = {
    version: "x-seishiro-client",
    lang: "x-seishiro-lang",
  },
}: {
  registry: RegistryBuilder;
  message: MessageBuilder;
  policy: PolicyBuilder;
  heading?: { version: string; lang: string };
})
```

- **`registry`**: An instance of `RegistryBuilder` to manage route and controller mappings.
- **`message`**: An instance of `MessageBuilder` to handle localized error or response messages.
- **`policy`**: An instance of `PolicyBuilder` to manage security and versioning rules.
- **`heading`**: Optional configuration for custom headers extracting the client version (`x-seishiro-client`) and requested language (`x-seishiro-lang`).

---

## Shared Types

The `Actions` class execution models heavily rely on the `RegistryParams` interface.

```typescript
type RegistryParams = {
  system: {
    cookies: { [key: string]: any };
    headers: { [key: string]: any };
    ip: string;
    location: string;
    lang: string | "en";
  };
  type: string; // The action key
  context_manager?: string;
  middleware?: object | Function | Promise<any>;
  data: object; // The actual payload request data
};
```

---

## Methods

### `BookRegistry(): cacheBookType`
Generates an encrypted list of available API registries and application versions. This is used to securely expose allowed actions to the client side.

```typescript
type cacheBookType = {
  iv_length: number;
  type_base: string;
  iv: string;
  data: string;
} | null;

// Usage:
const book = actions.BookRegistry();
console.log(book.data); // Encrypted payload
```

**Returns:** An object containing encryption metadata (`iv`, `type_base`, `iv_length`) and the encrypted `data` string.

---

### `async SystemAction(params: RegistryParams): Promise<any>`
The core execution engine that processes controllers and middlewares.

**Usage Scenario:** You generally don't call this directly, but rather through `ServerAction` or `APIAction`. However, if you are building a custom execution scope ignoring preset Gatekeeping contexts:

```typescript
const response = await actions.SystemAction({
  system: { cookies: {}, headers: {}, ip: "127.0.0.1", location: "unknown", lang: "en" },
  type: "user:profile",
  data: { id: 1 },
  context_manager: "custom"
});
```

---

### `async ServerAction(params: Omit<RegistryParams, "context_manager">): Promise<any>`
The entry point for Server-side actions (e.g., Next.js Server Actions). It checks against server-specific policies defined in `PolicyBuilder` before executing the underlying `SystemAction`.

**Usage:**

```typescript
// Inside a React Server Action
const response = await actions.ServerAction({
  system: systemContext,
  type: "product:buy",
  data: { productId: 42 }
});
```

- **Returns**: The standardized response, or a 404 error if the action is restricted by the server-side no-action policy.

---

### `async APIAction(params: Omit<RegistryParams, "context_manager">): Promise<any>`
The entry point for REST API requests. It checks against API-specific policies to prevent unauthorized access to sensitive endpoints before execution.

**Usage:**

```typescript
// Inside an Express/Elysia/Hono route
const response = await actions.APIAction({
  system: systemContext,
  type: "auth:login",
  data: req.body
});
```

- **Returns**: The standardized response, or a 404 error if the action is restricted by the API no-action policy.
