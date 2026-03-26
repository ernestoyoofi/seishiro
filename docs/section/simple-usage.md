# Simple Usage

Register Once, Execute Anywhere

---

## Defining Your Logic (Controller)

First, create a simple controller function. In Seishiro, the controller receives objects containing data from the client and system information.

```ts
// controllers/user.ts
export const UserProfile = async ({ data, system }) => {
  return {
    data: {
      id: "123",
      username: data.username,
      headers: system.headers, // Headers
      cookies: system.cookies, // Cookies
      location: system.location // Geolocation By IP
    }
  };
};
```

## Setting Up the Dispatcher

Connect your logic to Seishiro's control center.

```js
import { Registry, Message, Policy, Actions } from "seishiro";
import { UserProfile } from "./controllers/user";

// Map Registry
const registry = new Registry();
registry.set("user:get-profile", UserProfile); // Add Controller To Register

// Setup Orchestrator
const action = new Actions({
  registry,
  message: new Message("en"),
  policy: new Policy({
    passkey: "secret-key",
    version_now: "1.0.0",
    version_min: "1.0.0"
  })
});
```

## Executing via Different Protocols

This is Seishiro's main strength. You can call the same action through various entry points without changing the logic in the controller.

### A. via REST API (Standard)

Use this for public endpoints or third-party integrations, Checkout [example](https://github.com/ernestoyoofi/seishiro-test/blob/main/src/app/api/seishiro/route.js).

```js
const apiaction = await action.APIAction({
  type: "user:get-profile",
  data: { username: "shiroko" },
  system: {
    headers: { ...headers }, // Headers
    cookies: { ...cookies }, // Cookies
    ip: info.ip, // IP Address Client
    location: info.location, // Location By IP Address
  }
});

console.log(apiaction.response.data);
```

### B. via Server Action (Next.js)

Use this for internal server-side functions that require stricter security.

```js
const serveraction = await action.ServerAction({
  type: "user:get-profile",
  data: { username: "shiroko" },
  system: {
    headers: { ...headers }, // Headers
    cookies: { ...cookies }, // Cookies
    ip: info.ip, // IP Address Client
    location: info.location, // Location By IP Address
  }
});

console.log(serveraction.response.data);
```

### C. via System Action (SSR)

Use this for server-side rendering needs.

```js
const sysaction = await action.SystemAction({
  type: "user:get-profile",
  data: { username: "shiroko" },
  system: {
    headers: { ...headers }, // Headers
    cookies: { ...cookies }, // Cookies
    ip: info.ip, // IP Address Client
    location: info.location, // Location By IP Address
  }
});

console.log(sysaction.response.data);
```

## Understanding the Standard Response

Seishiro automatically wraps your work into a consistent response protocol. You no longer need to manually perform `NextResponse.json` or `res.status(200).json` on many files.

Example of a Successful Response Output:

```json
{
  "header": [],
  "set_cookie": [],
  "rm_cookie": [],
  "status": 200,
  "redirect": null,
  "error": null,
  "response": {
    "status": 200,
    "data": {
      "id": "123",
      "username": "shiroko"
    }
  }
}
```

Example of Error Response Output (Automatic):

```json
{
  "header": [],
  "set_cookie": [],
  "rm_cookie": [],
  "status": 404,
  "redirect": null,
  "error": "system:no-registry",
  "response": {
    "status": 404,
    "message": "Registry not found!",
    "protocol": "system"
  }
}
```
