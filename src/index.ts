import ZodValidatorContent from "./action-tool/zod-validate.js";
import * as NextJSAction from "./action-tool/action-next.js";
import * as ExpressJSAction from "./action-tool/action-express.js";
import * as HonoAction from "./action-tool/action-hono.js";
import * as FastifyAction from "./action-tool/action-fastify.js";
import * as ElysiaAction from "./action-tool/action-elysia.js";

import Registry from "./lib/registry.js";
import Message from "./lib/message.js";
import Policy from "./lib/policy.js";
export { default as Actions } from "./lib/actions.js";

export { Registry, Message, Policy };

/** @internal */
function createDeprecatedProxy<T extends abstract new (...args: any) => any>(
  target: T,
  oldName: string,
  newName: string,
): T {
  return new Proxy(target, {
    construct(t, args) {
      console.warn(
        `\x1b[31m[Seishiro Deprecation Warning]\x1b[0m: '${oldName}' is deprecated and will be removed in future versions. Please use '${newName}' instead.`,
      );
      return new (t as any)(...args);
    },
    get(t, prop) {
      if (prop !== "prototype" && prop !== "name") {
        console.warn(
          `\x1b[31m[Seishiro Deprecation Warning]\x1b[0m: Accessing '${oldName}.${String(prop)}' is deprecated. Please use '${newName}' instead.`,
        );
      }
      return (t as any)[prop];
    },
  }) as T;
}

/** @deprecated Seishiro: Use `Registry` instead. This will be removed in future versions. */
export const RegistryBuilder = createDeprecatedProxy(
  Registry,
  "RegistryBuilder",
  "Registry",
);
/** @deprecated Seishiro: Use `Message` instead. This will be removed in future versions. */
export const MessageBuilder = createDeprecatedProxy(
  Message,
  "MessageBuilder",
  "Message",
);
/** @deprecated Seishiro: Use `Policy` instead. This will be removed in future versions. */
export const PolicyBuilder = createDeprecatedProxy(
  Policy,
  "PolicyBuilder",
  "Policy",
);

/** @deprecated Seishiro: Use `Registry` instead. */
export type RegistryBuilder = Registry;
/** @deprecated Seishiro: Use `Message` instead. */
export type MessageBuilder = Message;
/** @deprecated Seishiro: Use `Policy` instead. */
export type PolicyBuilder = Policy;

export const ActionTools = {
  ZodValidatorContent,
  NextJS: NextJSAction,
  ExpressJS: ExpressJSAction,
  Hono: HonoAction,
  Fastify: FastifyAction,
  Elysia: ElysiaAction,
};
