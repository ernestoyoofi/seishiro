# Action Fastify

Provides integration between the Seishiro framework and the [Fastify](https://fastify.dev/) web framework.

## Methods

### `ActionRequest(req: any): Object`
Processes a Fastify `Request` object (`req`) to extract the system metadata, authentication context (headers and cookies), and the request payload (type and data).

- **`req`**: The Fastify Request object containing `headers`, `cookies`, `ip`, and `body` properties.
- **Returns**: A formatted object containing the `system` context (headers, cookies, extracted IP, and location) and the business payload (`type` and `data`).

---

### `ActionResponse(reply: any, requestdata: any): any`
Constructs a Fastify Response configuring the internal `reply` object. Handles fast JSON reply generation and sets HTTP statuses automatically.

- **`reply`**: The Fastify Reply object (`reply`).
- **`requestdata`**: The standardized response configuration from Seishiro's execution.
- **Returns**: The chained Fastify `reply.send()` execution.
