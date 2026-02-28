import ZodValidatorContent from "./action-tool/zod-validate.js";
import * as NextJSAction from "./action-tool/action-next.js";
import * as ExpressJSAction from "./action-tool/action-express.js";
import * as HonoAction from "./action-tool/action-hono.js";
import * as FastifyAction from "./action-tool/action-fastify.js";
import * as ElysiaAction from "./action-tool/action-elysia.js";

export { default as RegistryBuilder } from "./lib/registry.js";
export { default as MessageBuilder } from "./lib/message.js";
export { default as PolicyBuilder } from "./lib/policy.js";
export { default as Actions } from "./lib/actions.js";

export const ActionTools = {
  ZodValidatorContent,
  NextJS: NextJSAction,
  ExpressJS: ExpressJSAction,
  Hono: HonoAction,
  Fastify: FastifyAction,
  Elysia: ElysiaAction,
};
