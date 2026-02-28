# Action Express

Provides integration between the Seishiro framework and the [Express.js](https://expressjs.com/) web framework.

## Methods

### `ActionRequest(req: any): Object`
Processes an Express.js `Request` object (`req`) to extract the system metadata, authentication context (headers and cookies), and the request payload (type and data).

- **`req`**: The Express.js Request object containing `headers`, `cookies`, `ip`, and `body` properties.
- **Returns**: A formatted object containing the `system` context (headers, cookies, extracted IP, and location) and the business payload (`type` and `data`).

---

### `ActionResponse(res: any, requestdata: any): any`
Constructs an Express.js `Response` object (`res`), natively handling redirects, JSON response data formatting, custom headers binding, and cookie management algorithms.

- **`res`**: The Express.js Response object (`res`).
- **`requestdata`**: The standardized response configuration from Seishiro's execution.
- **Returns**: The Express JSON response object or directly handles redirection responses.
