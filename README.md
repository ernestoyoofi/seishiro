# Seishiro API

Seishiro eliminates the complexity of routing folder structures and replaces them with a single control center. Just use one endpoint, manage it through the Registry, and control your entire application data flow (Web, Mobile, and SSR) with consistent standards.

## Tasks

- [x] Registry Controllers
- [x] Message Builder Error
- [x] UnRegistry Base System
- [x] Multi Language Respon
- [x] Protocol Response
- [x] Middleware Runner
- [x] Action Executed
- [ ] Versioning Header (Pending...)
- [ ] Language Switch (Pending...)

## Installation

1. Manual Library Installation

   ```sh
   npm install seishiro
   # OR
   bun add seishiro
   yarn add seishiro
   ```

2. Copy the file example and then copy some of its structure for the sample. You can manage this system to be much more complex.
3. Set up and customize it as you like.
4. Add auth-cookie to put the default placeholder and client version.
5. Boom! Done!

## Usage

```js
import dotenv from "dotenv"
import { UserLogin, UserProfile } from "@/controllers"
import { MiddlewareSystem } from "@/middlewares"
import { RegistryBuilder, MessageBuilder, PolicyBuilder, Actions } from "seishiro"

// Init ENV
dotenv.config()

// Registry
const registry = new RegistryBuilder()
registry.set("user:login", UserLogin)
registry.set("user:profile", UserProfile, MiddlewareSystem) // Using Middleware

// Message Error
const message = new MessageBuilder("en")
// Default Variable Message
message.set("no-response-sending", "Server not response!");
message.set("no-registry", "Registry not found!");
message.set("internal-server-error", "Internal server error!");
// Costum Variable Message
message.set("user-not-login", "{{username}} has not login!")
message.set("user-not-found", "{{username}} not found!")

// Rules System
const policy = new PolicyBuilder({
  passkey: process.env.SEISHIRO_PASSKEY, // (Require!) For Book Registry Access
  version_now: "1.4.5", // (Require!) Only support number (0-9.)
  version_min: "1.4.0", // (Require!) Minimum version
  version_forceupdate: true, // (Require!) If client on minimum version, client need to force update
})
policy.noaction("user:login", ["server-action"]) // block from server action
policy.noaction("user:login", ["api-action"]) // block from api action

// Action Setup
const action = new Actions({
  registry: registry,
  message: message,
  policy: policy,
})

// System Action - For Server Side Rendering
const sysaction = await action.SystemAction({
  system: {
    headers: {...}, // Header KV (Key, Value)
    cookies: {...}, // Cookie KV (Key, Value)
    ip: "103.214.146.116", // IP Address (IP Client - Example)
    location: "JKT, Jakarta, Jakarta Pusat", // Location (Location Client By IP & PeerDB - Example)
  },
  type: "user:login", // Type Action
  data: {
    email: "testing@localhost.id",
    password: "testing1234"
  }
})
console.log(sysaction.response) // Response Data

// Server Action - For Server Action (Next.js)
const serveraction = await action.ServerAction({
  system: {
    headers: {...}, // Header KV (Key, Value)
    cookies: {...}, // Cookie KV (Key, Value)
    ip: "103.214.146.116", // IP Address (IP Client - Example)
    location: "JKT, Jakarta, Jakarta Pusat", // Location (Location Client By IP & PeerDB - Example)
  },
  type: "user:profile", // Type Action
  data: {
    username: "testing1234"
  }
})
console.log(serveraction.response) // Response Data

// API Action - For Rest API
const apiaction = action.APIAction({
  system: {
    headers: {...}, // Header KV (Key, Value)
    cookies: {...}, // Cookie KV (Key, Value)
    ip: "103.214.146.116", // IP Address (IP Client - Example)
    location: "JKT, Jakarta, Jakarta Pusat", // Location (Location Client By IP & PeerDB - Example)
  },
  type: "user:profile", // Type Action
  data: {
    username: "testing1234"
  }
})
console.log(apiaction.response) // Response Data

// Book Registry (List All Registry On Base Encrypted)
const bookRegistryJson = action.BookRegistry()
console.log(bookRegistryJson)
```