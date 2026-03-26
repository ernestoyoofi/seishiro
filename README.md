# Seishiro API

> [!CAUTION]
> This library is currently in development. Although several stable versions have been released, it is not yet ready for production use. Please review its usage carefully. At this time, it only supports the Next.js, Express.js, and Nova.js frameworks.
>
> Thank you for using this library. If you encounter any issues, please report them so we can address them in the development version.

Seishiro **eliminates the complexity of routing folder structures and replaces them with a single control center**. Just use one endpoint, manage it through the Registry, and control your entire application data flow (Web, Mobile, and SSR) with consistent standards.

## Features

- **Centralized Registry**: Manage all your application logic in one place.
- **Built-in Policy**: Control versioning and access rules with ease.
- **Smart Messaging**: Multi-language support with dynamic variables.
- **Protocol Agnostic**: Works seamlessly with REST APIs, Server Actions (Next.js), and SSR.
- **Secure by Default**: Registry list encryption using AES-256-CTR.

## Installation

To get started with Seishiro, install it via your favorite package manager:

```bash
# npm
npm install seishiro
# bun
bun add seishiro
# yarn
yarn add seishiro
# pnpm
pnpm add seishiro
```

## Quick Start

Seishiro's workflow is built around three pillars: **Registry, Message, and Policy.**

```javascript
import { Registry, Message, Policy, Actions } from "seishiro";

// 1. Setup Registry (Your Business Logic)
const registry = new Registry();
registry.set("user:login", UserLogin);
registry.set("user:profile", UserProfile, [AuthMiddleware]); // Supports Middlewares!

// 2. Setup Messaging (Multi-language Support)
const message = new Message("en");
message.set("user-not-found", "{{username}} not found!");

// 3. Setup Policy (Access & Versioning Control)
const policy = new Policy({
  passkey: process.env.SEISHIRO_PASSKEY,
  version_now: "1.0.0",
  version_min: "0.9.0",
  version_forceupdate: true,
});

// 4. Initialize Action Center
const action = new Actions({ registry, message, policy });

// 5. Execute - Choose your protocol!
const response = await action.APIAction({
  type: "user:login",
  data: {
    email: "user@example.com",
    password: "password123"
  }
});

console.log(response.response);
```

### Modern Architecture

| Component | Description |
| :--- | :--- |
| **Registry** | Maps action types to their corresponding controllers and middlewares. |
| **Message** | Handles all system responses and multi-language error messages. |
| **Policy** | Enforces security, versioning, and access control for specific actions. |
| **Action** | The execution engine that processes requests through the system. |

## Learn More

Ready to dive deeper? Explore our specialized documentation and framework integrations.

### Framework Integrations

> [!IMPORTANT]  
> Action Tools is now available, but some features require improvements to function properly. Currently, there are no benchmarks and testing for multiple REST API frameworks, and for now, Action Tools is primarily focused on Next.js, Express.js, and Zod as validators.

We provide specialized tools and examples for modern web frameworks:

- [Zod Validation (Library validator)](./docs/action-tool/zod-validate.md) - ✅ Stable
- [Next.js](./docs/action-tool/action-next.md) - ✅ Stable
- [Elysia JS](./docs/action-tool/action-elysia.md) - ⚠️ Work in progress & Testing
- [Hono](./docs/action-tool/action-hono.md) - ⚠️ Work in progress & Testing
- [Express](./docs/action-tool/action-express.md) - ⚠️ Need to fix
- [Fastify](./docs/action-tool/action-fastify.md) - ⚠️ Work in progress & Testing

Explore all action tools here: [**Action Tools Documentation**](./docs/action-tool)

