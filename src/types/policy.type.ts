// Policy Setup Keys
export type PolicyPassKey = string;
export type PolicyVersionNow = string;
export type PolicyVersionMin = string;
export type PolicyVersionForceUpdate = boolean;
// Policy Action Keys
export type PolicyNoActionKey = string;
type AllowedActions = "server-action" | "api-action";
export type PolicyNoActionBase = AllowedActions[];
// Policy List Registry
export type PolicyNoActionAPIAction = string[];
export type PolicyNoActionServerAction = string[];
