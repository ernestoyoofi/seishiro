# Change Log

Update history of Seishiro

---

## 0.2.31-dev (pending...)

Update for Next.js driver, middleware rules and [Nova.js](https://github.com/untrustnova/nova) support.

<details>
  <summary>Adding (1)</summary>

  1. Update a middleware & Support multiple middleware.

</details>

<details>
  <summary>Pending (3)</summary>

  1. New driver for Next.js to automaticly build API with folder structure.
  2. Apply new middleware rules.
  3. Try new support to [Nova.js](https://github.com/untrustnova/nova).

</details>

<details>
  <summary>Patches (1)</summary>

  1. Adding default passkey to fixed empty value.

</details>

<details>
  <summary>Remove (2)</summary>

  1. `skip_middleware_context` has deprecated, by default middleware won't send context to controller.
  2. The builder code has now been removed on `RegistryBuilder`, `MessageBuilder`, `PolicyBuilder`, simply restore its functionality like `Registry`, `Message`, `Policy`. Please migrate before the next version.

</details>

## 0.2.3-release

Releasing the first version without library stability, an early release phase with additional tools

<details>
  <summary>Adding (6)</summary>

  1. Action tools for Zod Validator
  2. Action tools for Next.js
  3. Action tools for Express.js
  4. Action tools for Elysia.js
  5. Action tools for Fastify.js
  6. Action tools for Hono.js

</details>

<details>
  <summary>Patches</summary>

  _Nothing :3_

</details>

<details>
  <summary>Remove</summary>

  _Nothing :3_

</details>