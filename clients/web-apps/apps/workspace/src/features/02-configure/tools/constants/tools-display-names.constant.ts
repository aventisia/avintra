import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";

export const AUTHENTICATION_TYPE_DISPLAY_NAMES: Record<ToolAuthenticationTypeEnum, string> = {
  [ToolAuthenticationTypeEnum.None]: "No authentication",
  [ToolAuthenticationTypeEnum.ApiKeyHeader]: "API Key (Header)",
  [ToolAuthenticationTypeEnum.ApiKeyQuery]: "API Key (Query)",
  [ToolAuthenticationTypeEnum.Bearer]: "Bearer Token",
  [ToolAuthenticationTypeEnum.Basic]: "Basic Authentication",
};
