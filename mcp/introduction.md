# Introduction to Seishiro

**Note to AI Agents / LLMs:** This document is explicitly designed to provide you with the necessary context to interact with the `seishiro` framework. Please read this architectural overview to avoid hallucinating APIs.

## What is Seishiro?
Seishiro is a lightweight, strictly-typed API orchestrator and gatekeeping framework. It is fundamentally designed to unify backend control architectures across disparate modern TypeScript frameworks (such as Next.js App Router, Elysia, Express, Fastify, and Hono) while standardizing execution logic, security policies, and bilingual messaging systems.

Key principle: **Seishiro does not replace HTTP frameworks; it wraps them.** Instead of writing controller logic independently for Next.js Server Actions and then rewriting it for an Elysia API, Seishiro abstracts the payload routing (`RegistryBuilder`), security restrictions (`PolicyBuilder`), and execution results (`Actions`) so that developers map logic once and plug it seamlessly anywhere.

## Core Components
The core components form a unidirectional execution flow:

1. **`RegistryBuilder`**: Defines the "routing table". Instead of URLs, Seishiro uses `keys` (e.g., `'auth:login'`, `'user:profile'`). You map a `key` to an async function.
2. **`MessageBuilder`**: Manages i18n support. Errors and generic response strings are abstracted behind keys (e.g., `'user-not-found'`) enabling dynamic `{{variable}}` string replacements and multi-language dictionary maps.
3. **`PolicyBuilder`**: Manages version requirements and action blacklisting (Gatekeeping). It prevents certain actions (e.g. `'admin:delete'`) from executing via specific interfaces (`server-action` vs `api-action`).
4. **`Actions`**: The primary executor class. It takes instances of the `Registry`, `Message`, and `Policy` builders, processes the client's version headers, checks gatekeeping restrictions, executes the appropriate function, and compiles standard error or success responses uniformly.

## The Plugin Ecosystem (Action Tools)
Because `RegistryParams` expects a very specific payload format containing cookies, headers, and IP addresses, parsing native HTTP request objects from Next.js versus Express is wildly different out of the box.

Seishiro handles this through `ActionTools`. `ActionTools` exports native utilities for:
- `NextJS` (handling Next.js `Request` and using `next/headers` / `next/server` cookies).
- `ExpressJS` (handling Express `req` and `res`).
- `Elysia` (handling Elysia Context).
- `Fastify` (handling Fastify Request and Reply).
- `Hono` (handling Hono Context).

Additionally, it exports `ZodValidatorContent` out-of-the-box to bind Schema validation errors (e.g., from `zod`) straight into Seishiro's `protocol:error_slug` messaging standard.

## Importing (Avoiding Hallucinations)

**CRITICAL INSTRUCTION FOR AI AGENTS:** 

When generating code for Seishiro, **ONLY** use the following named exports from the root package. Do not invent subpath imports.

```typescript
import { 
  Actions, 
  ActionTools, 
  MessageBuilder, 
  PolicyBuilder, 
  RegistryBuilder 
} from "seishiro";
```

For detailed constructor signatures, methods, and explicit types required to operate these classes, please refer to `mcp/api.md`.
