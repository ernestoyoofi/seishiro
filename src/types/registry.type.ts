// Registry Key
export type RegistryKey = string;
// Registry Params
export type RegistryParams = {
  system: {
    cookies: object;
    headers: object;
    ip: string;
    location: string;
    lang: string | "en";
  };
  type: RegistryKey;
  middleware?: object | Function | Promise<any>;
  data: object;
};
// Registry Function
export type RegistryFunction = (params: RegistryParams) => any;
export type RegistryMiddleware = (params: RegistryParams) => any;
export type RegistryLogic = Record<
  RegistryKey,
  RegistryFunction | [RegistryMiddleware, RegistryFunction]
>;
