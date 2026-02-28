# Action Hono

Provides integration between the Seishiro framework and the [Hono](https://hono.dev/) web framework.

## Methods

### `ActionRequest(c: any): Promise<Object>`
Processes a Hono `Context` object (`c`) to extract the system metadata, authentication context (headers and cookies), and the request payload (type and data).

- **`c`**: The Hono Context object managing the incoming request format natively via `c.req`.
- **Returns**: A formatted object containing the `system` context (headers, cookies, extracted IP, and location) and the business payload (`type` and `data`).

---

### `ActionResponse(c: any, requestdata: any): any`
Constructs a Hono Response configuring the active `Context` object. Adjusts native redirect rules or appends raw `Set-Cookie` records if specific plugins are omitted.

- **`c`**: The Hono Context object (`c`).
- **`requestdata`**: The standardized response configuration from Seishiro's execution.
- **Returns**: The `c.json()` execution result handling headers and data sending.
