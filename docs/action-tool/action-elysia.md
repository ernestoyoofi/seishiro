# Action Elysia

Action for Elysia

---

Provides integration between the Seishiro framework and the [ElysiaJS](https://elysiajs.com/) web framework.

## Methods

### `ActionRequest(ctx: any): Promise<Object>`
Processes an Elysia `Context` object (`ctx`) to extract the system metadata, authentication context (headers and cookies), and the request payload (type and data).

- **`ctx`**: The Elysia Context object containing `request`, `cookie`, and `body` properties.
- **Returns**: A formatted object containing the `system` context (headers, cookies, extracted IP, and location) and the business payload (`type` and `data`).

---

### `ActionResponse(set: any, requestdata: any): any`
Constructs an Elysia response using the Elysia `set` object.

- **`set`**: The Elysia response configuration object.
- **`requestdata`**: The standardized response configuration from Seishiro's execution.
- **Returns**: The JSON response object or modifies the `set.redirect` property if a redirect is triggered.

## Usage Example

```typescript
import { Elysia } from "elysia";
import { ActionTools, Actions } from "seishiro";

// Assuming `actions` is your configured Actions instance
const app = new Elysia();

app.post("/api", async (ctx) => {
  // 1. Extract context
  const payload = await ActionTools.Elysia.ActionRequest(ctx);
  
  // 2. Execute through Seishiro
  const result = await actions.APIAction(payload);
  
  // 3. Return formatted response
  return ActionTools.Elysia.ActionResponse(ctx.set, result);
});
```
