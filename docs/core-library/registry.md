# Registry Builder

The `RegistryBuilder` class serves as the central routing component for the Seishiro API system. It maps unique action keys to their corresponding controllers and optional middleware functions.

## Constructor

```typescript
constructor()
```
Initializes an empty registry logic map to store the references.

---

## Shared Types

The registry functions require specific typing aligned with the request workflow:

```typescript
type RegistryParams = {
  system: {
    cookies: { [key: string]: any };
    headers: { [key: string]: any };
    ip: string;
    location: string;
    lang: string | "en";
  };
  type: string;
  context_manager?: string;
  middleware?: object | Function | Promise<any>;
  data: object;
};

type RegistryFunction = (params: RegistryParams) => any;
type RegistryMiddleware = (params: RegistryParams) => any;
```

---

## Methods & Usage

### `set(key: string, function_regis: RegistryFunction, middleware?: RegistryMiddleware): void`
Registers an execution controller string-key mapping. It optionally maps a middleware function that executes before the main controller.

**Usage without middleware:**

```typescript
const registry = new RegistryBuilder();

registry.set("user:profile", async ({ data }) => {
  return { status: 200, data: { name: "Ernest", id: data.id } };
});
```

**Usage with middleware:**

```typescript
const authMiddleware = async ({ system }) => {
  if (!system.headers.authorization) {
    return { error: "auth:unauthorized", status: 401 };
  }
  return { user_id: 123 }; // Passed to the controller
};

registry.set("user:settings", async ({ middleware }) => {
  // middleware contains { user_id: 123 } if auth succeeds
  return { status: 200, data: { theme: "dark" } };
}, authMiddleware);
```

---

### `get(key: string): RegistryFunction | [RegistryMiddleware, RegistryFunction] | undefined`
Retrieves the registered functions associated with the specific key lookup.

**Usage:**

```typescript
const handler = registry.get("user:profile");
```

---

### `apply(): Map<string, RegistryFunction | [RegistryMiddleware, RegistryFunction]>`
Retrieves the internal mapping object holding all route handlers and configurations.

---

### `use(input: RegistryBuilder | Record<string, any>): void`
Merges another `RegistryBuilder` instance or a raw configuration object natively into the current registry. This permits clean module scaling across various files.

**Usage:**

```typescript
const authRoutes = new RegistryBuilder();
authRoutes.set("auth:login", loginController);

// Main registry
const registry = new RegistryBuilder();
registry.use(authRoutes); // Merges 'auth:login' into the main registry

// Or passing a plain object:
registry.use({
  "ping": () => ({ data: "pong" })
});
```
