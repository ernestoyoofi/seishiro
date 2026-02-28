# Seishiro API Reference

**Note to AI Agents / LLMs:** This is the strictly-typed technical API reference for Seishiro. Do not guess types or method signatures; follow this specification strictly.

## Base Imports

Always import from the root module:
```typescript
import { Actions, ActionTools, MessageBuilder, PolicyBuilder, RegistryBuilder } from "seishiro";
```

---

## 1. RegistryBuilder
Centralizes the mapping of unique action keys to their respective controllers and optional middlewares.

### Types
```typescript
type RegistryParams = {
  system: {
    cookies: Record<string, any>;
    headers: Record<string, any>;
    ip: string;
    location: string;
    lang: string | "en";
  };
  type: string;
  context_manager?: string;
  middleware?: object | Function | Promise<any>;
  data: object; // The payload data
};

type RegistryFunction = (params: RegistryParams) => any;
type RegistryMiddleware = (params: RegistryParams) => any;
```

### Methods
- **`set(key: string, function_regis: RegistryFunction, middleware?: RegistryMiddleware): void`**
  Registers a controller mapped to a string `key`.
- **`get(key: string): RegistryFunction | [RegistryMiddleware, RegistryFunction] | undefined`**
- **`use(input: RegistryBuilder | Record<string, any>): void`**
  Merges another router/registry object mapping into the main one.

---

## 2. PolicyBuilder
Manages execution restrictions (Gatekeeping) and Version Control requirements.

### Signature
```typescript
constructor(config: {
  passkey: string;      // Used for BookRegistry encryption (SHA-256)
  version_now: string;  // e.g. "1.0.0"
  version_min: string;  // Default min required client version
  version_forceupdate?: boolean; // Default true
  skip_middleware_context?: boolean; // Skip native restructuring of middleware responses
})
```

### Methods
- **`noaction(type: string, action: Array<"server-action" | "api-action">): void`**
  Restricts the execution context of a Registry Key.
  `policy.noaction("secret:route", ["api-action"])` means `Actions.APIAction()` will throw a 404 for `"secret:route"`, but `Actions.ServerAction()` would succeed.
- **`version_info(clientVersion?: string): { info_upgrade: boolean, is_version_min: boolean, is_version_now: boolean }`**

---

## 3. MessageBuilder
Standardized multi-language message formatting and templating.

### Signature
```typescript
constructor(language?: string = "en")
```

### Methods
- **`set(key: string, value: string): void`**
  Registers a template string (e.g., `"Welcome {{name}}!"`).
- **`get(key?: string, lang?: string): string`**
- **`errorMessage(errorSlug?: string, errorOpt?: Record<string, string>, lang?: string): string`**
  Ejects a formatted string parsing the slug templates values containing the optional params map.
- **`error(errorStr?: string, errorOpts?: Record<string, string>[], lang?: string): Object`**
  Parses Seishiro standard error notation `"protocol:slug_a|slug_b"` and returns `{ protocol, context, params, message }`.
- **`use(input: MessageBuilder | Record<string, string>): void`**

---

## 4. Actions
The execution wrapper.

### Signature
```typescript
constructor(config: {
  registry: RegistryBuilder;
  message: MessageBuilder;
  policy: PolicyBuilder;
  heading?: { version: string; lang: string }; // defaults to "x-seishiro-client", "x-seishiro-lang"
})
```

### Methods
- **`BookRegistry(): { iv_length: number, type_base: string, iv: string, data: string }`**
  Exposes the available non-restricted API actions for the client map.
- **`APIAction(params: Omit<RegistryParams, "context_manager">): Promise<any>`**
  Executes the registry function asserting it is NOT blocked by `"api-action"` policies.
- **`ServerAction(params: Omit<RegistryParams, "context_manager">): Promise<any>`**
  Executes the registry function asserting it is NOT blocked by `"server-action"` policies.
- **`SystemAction(params: RegistryParams): Promise<any>`**
  Bypasses execution protocol restrictions.

---

## 5. ActionTools
Contains framework-specific plugins to destruct system variables seamlessly. Always used before feeding metadata into `Actions`.

### Available Plugins
`ActionTools.NextJS`, `ActionTools.ExpressJS`, `ActionTools.Hono`, `ActionTools.Fastify`, `ActionTools.Elysia`.

Each framework object exports:
- **`ActionRequest(request_object): Promise<{ system, type, data }>`** (or sync, depending on structure)
- **`ActionResponse(response_object, seishiro_result)`**

### Framework Examples

**Elysia:**
```typescript
import { ActionTools } from "seishiro";

app.post("/api", async (ctx) => {
  const payload = await ActionTools.Elysia.ActionRequest(ctx);
  const result = await actions.APIAction(payload);
  return ActionTools.Elysia.ActionResponse(ctx.set, result);
});
```

**Next.js (App Router API):**
```typescript
import { ActionTools } from "seishiro";

export async function POST(req: Request) {
  const payload = await ActionTools.NextJS.ActionRequest(req);
  const result = await actions.APIAction(payload);
  return await ActionTools.NextJS.ActionResponse(req, result);
}
```

### Zod Validation Utility
`ActionTools.ZodValidatorContent` evaluates validation and formats directly to the Seishiro `MessageBuilder` standard syntax.

**Usage:**
```typescript
import { z } from "zod";
import { ActionTools } from "seishiro";

const schema = z.object({ id: z.number() });

// Returns { error: "auth:zod_error...", params: [...] } or null if success.
const mappedError = ActionTools.ZodValidatorContent("auth", schema, data); 
if (mappedError) return mappedError;
```
