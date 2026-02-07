import { RegistryBuilder, MessageBuilder, PolicyBuilder, Actions } from "./dist";

// Registry
const registry = new RegistryBuilder();

// Message
const message = new MessageBuilder("en");

// Default Variable Message
message.set("no-response-sending", "Server not response!");
message.set("no-registry", "Registry not found!");
message.set("internal-server-error", "Internal server error!");

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