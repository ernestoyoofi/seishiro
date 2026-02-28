# Zod Validation

Zod validator schema

---

The Zod Validator provides a structural validation plugin mapping generic runtime shape definitions to the Seishiro standard error propagation protocols, supporting libraries like [`Zod`](https://zod.dev/) without hard dependency bonding.

## Methods

### `ZodValidatorContent(schemaProtocol: string, zodObject: ZodLike, data: any): Object | null`
Validates the provided data chunk against an object schema (or functionally any structure implementing `.safeParse()`). Maps validation anomalies into a pipe-separated string structure recognized directly by the `MessageBuilder` system protocols.

- **`schemaProtocol`**: The application protocol identifier prepended to the generated error slug (e.g., `'auth'` causing `'auth:some_error|other_error'`).
- **`zodObject`**: A compatible Schema struct object implementing a `.safeParse()` routine natively or mapped explicitly.
- **`data`**: The unknown payload parameter map being asserted against the schema runtime properties.
- **Returns**: Returns `null` if the payload parsing passes without issue or exception. Otherwise, it returns a formatted error object with the `error` string protocol binding and mapped format `params`.

## Usage Example

```typescript
import { z } from "zod";
import { ActionTools } from "seishiro";

// 1. Define a Zod schema
const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Inside a registry controller middleware or function
const myMiddleware = async ({ data }) => {
  // 2. Validate the data payload
  const errorMapping = ActionTools.ZodValidatorContent("auth", loginSchema, data);
  
  // 3. If validation fails, return the error immediately
  if (errorMapping) {
    return {
      status: 400,
      error: errorMapping.error, // e.g. "auth:invalid_type|too_small"
      params: errorMapping.params // Maps zod parameters automatically
    };
  }
  
  // Return undefined or modified data if validation passes
  return {};
};
```
