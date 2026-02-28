# Seishiro API

The Centralized API Orchestrator for Modern Web Applications.

---

Seishiro is a library orchestrator API that eliminates the complexity of managing folder routing structures. Instead of managing dozens of scattered route files, Seishiro centralizes control of your application in a single Registry.

Whether you are building a Web (REST), Mobile, or Server-Side Rendering (SSR) application, Seishiro ensures consistent data flow standards.

## Why Seishiro?

Seishiro was born out of a common concern in modern application development: increasingly complex routing and inconsistent responses.

1. **Eliminating Routing Complexity**
   Seishiro's main vision is to eliminate traditional folder routing management. Inspired by the flexibility of GraphQL, Seishiro uses a Single Request Command Dispatcher system. You no longer need to create dozens of route files; just use one endpoint as the control center for all your application actions.

2. **Standardized Protocol Response**
   We believe developers shouldn't have to waste time setting HTTP statuses, manual headers, or different JSON structures in each file.
   a. **Auto-Building Response**: Seishiro automatically builds consistent status codes, headers, and data structures.
   b. **Immutable Structure**: Seishiro's response structure will never change, ensuring that the integration between the Backend and Frontend (Web, Mobile, SSR) is always in sync without any surprise breaking changes.

3. **Developer-Centric Workflow**
   Seishiro follows the natural workflow of developers. By separating Registry, Policy, and Message, you can focus on business logic without having to think about the data delivery infrastructure repeatedly.

4. **Integrated Versioning & Lifecycle**
   One of our main missions is to simplify application maintenance on the client side.
   a. **Auto-Update Signal**: Through the versioning system in PolicyBuilder, Seishiro can detect the client version and provide direct instructions to display an update banner or force an automatic update on the View side.
   b. **Consistency at Scale**: Ensures that the application version running on the user's device is always compatible with the API on the server.

## Key Value Propositions

1. **Centralized Control**: Manage all application endpoints in one RegistryBuilder.
2. **Protocol Agnostic**: One logic for multiple protocols: API Action, Server Action (Next.js), and System Action.
3. **Smart Messaging**: Multi-language error messaging system with dynamic variable support.
4. **Security Layer**: Endpoint protection based on registry list encryption via AES-256-CTR.
5. **Version Enforcement**: Full control over the client versions allowed to access the system.

## How It Works?

1. **The Policy**: Checks whether the client has the appropriate permissions and version.
2. **The Registry**: Searches for the appropriate controller and middleware for the request.
3. **The Message**: Formats the response into the desired language in case of an error or success.

## Quick Start For Example!

Get full control over your API in just a few simple steps:

```bash
npm install seishiro
# Or Use Bun?
bun add seishiro
```

```js
import { RegistryBuilder, PolicyBuilder, Actions } from "seishiro"

// Set Your Variable Message
const message = new MessageBuilder("en")
// Default Variable Message
message.set("no-response-sending", "Server not response!")
message.set("no-registry", "Registry not found!")
message.set("internal-server-error", "Internal server error!")
// Costum Variable Message
message.set("user-not-login", "{{username}} has not login!")
message.set("user-not-found", "{{username}} not found!")

// Register your logic
const registry = new RegistryBuilder()
registry.set("user:profile", GetUserProfile, AuthMiddleware);

// Set Your Policy Rules
const policy = new PolicyBuilder({
  passkey: process.env.SEISHIRO_PASSKEY, // For Book Registry Access
  version_now: "1.4.5", // Only support number (0-9.)
  version_min: "1.4.0", // Minimum version
  version_forceupdate: true, // Force Update
})

// Setup Action
const action = new Actions({
  registry: registry,
  message: message,
  policy: policy,
})

// Execute anywhere
const response = await action.APIAction({ type: "user:detail", data: { username: "@me" } });
```

## Explore the Documentation

- [Getting Started](./section/installation.md): Installation and initial setup.
- [Core Concepts](./core-library/registry.md): Understanding Registry, Message, and Policy.
- [Advanced Usage](./section/book-registry.md): About Book Registry and why use Encrypted.