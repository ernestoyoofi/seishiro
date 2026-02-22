import {
  RegistryBuilder,
  MessageBuilder,
  PolicyBuilder,
  Actions,
} from "./dist";

const timeStart = new Date().getTime();

// Registry
const registry = new RegistryBuilder();
registry.set("user:login", async () => {});
registry.set(
  "user:middleware",
  async () => {},
  async () => {},
);

// Message
const message = new MessageBuilder("en");

// Default Variable Message
message.set("no-response-sending", "Server not response!");
message.set("no-registry", "Registry not found!");
message.set("internal-server-error", "Internal server error!");
message.set("client-version-required", "Client version is required!");
message.set("need-upgrade-client", "Need upgrade client!");

// Policy
const policy = new PolicyBuilder({
  passkey: "testing1234",
  version_now: "1.4.5",
  version_min: "1.4.0",
  version_forceupdate: true,
});

// Server
const action = new Actions({
  registry: registry,
  message: message,
  policy: policy,
});

const timeEnd = new Date().getTime();

console.log({
  registry,
  policy,
  action,
  message,
  time: timeEnd - timeStart,
});

message.set("variable", "Hii {{name}}")

console.log(message.errorMessage("variable", { name: "Shiroko!" }))