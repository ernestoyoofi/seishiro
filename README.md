# Seishiro API

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
import { RegistryBuilder, MessageBuilder, PolicyBuilder, Actions } from "seishiro";

// 1. Setup Registry (Your Business Logic)
const registry = new RegistryBuilder();
registry.set("user:login", UserLogin);
registry.set("user:profile", UserProfile, [AuthMiddleware]); // Supports Middlewares!

// 2. Setup Messaging (Multi-language Support)
const message = new MessageBuilder("en");
message.set("user-not-found", "{{username}} not found!");

// 3. Setup Policy (Access & Versioning Control)
const policy = new PolicyBuilder({
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
  data: { email: "user@example.com", password: "password123" }
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
We provide specialized tools and examples for modern web frameworks:

- [Elysia JS](./docs/action-tool/action-elysia.md)
- [Hono](./docs/action-tool/action-hono.md)
- [Express](./docs/action-tool/action-express.md)
- [Fastify](./docs/action-tool/action-fastify.md)
- [Next.js](./docs/action-tool/action-next.md)
- [Zod Validation (Library validator)](./docs/action-tool/zod-validate.md)

Explore all action tools here: [**Action Tools Documentation**](./docs/action-tool)

