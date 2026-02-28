# Action Next.js

Action for Next.js

---

Provides integration between the Seishiro framework and the [Next.js](https://nextjs.org/) web framework, optimized for Next.js Server Actions and Route Handlers.

## Methods

### `ActionRequest(req: Request): Promise<Object>`
Processes an incoming Next.js generic `Request` instance to construct the execution arguments. It supports multipart Form Data (including Blob binary extraction) or JSON parsing out of the box. Leverages `next/headers` and `@vercel/functions` automatically to securely grab cookies or precise remote addresses transparently within server contexts.

- **`req`**: The incoming Next.js `Request` object.
- **Returns**: A formatted object containing the `system` context and the business payload parsed from the request body stream.

---

### `ActionResponse(req: Request, requestdata: any): Promise<Response>`
Constructs a `NextResponse` handling absolute redirects, setting cookies asynchronously matching Next.js App Router rules, and appending specialized native headers seamlessly.

- **`req`**: The original `Request` object wrapper (required for absolute URL redirect resolution mapping).
- **`requestdata`**: The standardized response configuration from Seishiro's execution.
- **Returns**: A fully materialized `NextResponse` JSON object structure resolving to the client.

## Usage Example

```typescript
import { ActionTools, Actions } from "seishiro";

// App Router API Route (e.g., app/api/route.ts)
export async function POST(req: Request) {
  // 1. Extract context (Next.js action request handles formData, blobs, and json natively)
  const payload = await ActionTools.NextJS.ActionRequest(req);
  
  // 2. Execute through Seishiro
  const result = await actions.APIAction(payload);
  
  // 3. Return formatted NextResponse
  return await ActionTools.NextJS.ActionResponse(req, result);
}
```
