# Policy Builder

Seishiro Policy Builder is a class that manages application-level policies. It controls security aspects such as the encryption passkey, version control, and protocol-specific action restrictions (Gatekeeping).

---

The `PolicyBuilder` class manages application-level policies. It controls security aspects such as the encryption passkey, version control, and protocol-specific action restrictions (Gatekeeping).

## Constructor

```typescript
constructor({
  passkey,
  version_now,
  version_min,
  version_forceupdate = true,
  skip_middleware_context = false,
}: {
  passkey: string;
  version_now: string;
  version_min: string;
  version_forceupdate?: boolean;
  skip_middleware_context?: boolean;
})
```

- **`passkey`**: The secret key string used for encryption calculations, such as in the creation of the registry book payload (SHA-256).
- **`version_now`**: The current stable semantic version of the client application (e.g., `"1.0.1"`).
- **`version_min`**: The minimum required version for clients to access the APIs.
- **`version_forceupdate`**: A flag indicating if clients running a version below the `version_min` are forced to upgrade.
- **`skip_middleware_context`**: If true, prevents the results of middlewares from automatically being restructured into standard responses, allowing standard middlewares to pass their exact returned states.

---

## Methods & Usage

### `noaction(type?: string, action?: Array<"server-action" | "api-action">): void`
Restricts specific action types from being accessed via specific protocols.

**Usage:**

```typescript
const policy = new PolicyBuilder({ ...config });

// Block 'admin:delete' from being accessible via HTTP REST API
policy.noaction("admin:delete", ["api-action"]);

// Block 'auth:login' from Server Actions (e.g. force client-side authentication)
policy.noaction("auth:login", ["server-action"]);
```

---

### `version_info(clientVersion?: string): Object`
Evaluates a provided client version payload against the application's version settings.

**Usage:**

```typescript
// Assuming version_min="1.0.0" and version_now="1.2.0"
const status = policy.version_info("0.9.0");

/* Returns:
{
  info_upgrade: true, // From version_forceupdate
  is_version_min: false, // 0.9.0 < 1.0.0
  is_version_now: false
}
*/
```

---

### `apply(): Object`
Retrieves the fully compiled policy configuration map.

**Usage:**

```typescript
const config = policy.apply();
console.log(config.noaction_api); // Lists all API-restricted action keys
```
