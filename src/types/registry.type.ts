// Registry Key
export type RegistryKey = string;
// Registry Params
export type RegistryParams = {
  system: {
    cookies: {
      [key: string]: any;
    };
    headers: {
      [key: string]: any;
    };
    ip: string;
    location: string;
    lang: string | "en";
  };
  type: RegistryKey;
  context_manager?: string;
  middleware?: object | Function | Promise<any>;
  data: object;
};
// Registry Function
export type RegistryFunction = (params: RegistryParams) => any;
export type RegistryMiddleware = (params: RegistryParams) => any;
export type RegistryLogic = Map<
  RegistryKey,
  RegistryFunction | [RegistryMiddleware, RegistryFunction]
>;
