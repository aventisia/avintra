import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";

export const AUTHENTICATION_TYPE_DISPLAY_NAMES: Record<ToolAuthenticationTypeEnum, string> = {
  [ToolAuthenticationTypeEnum.None]: "No authentication",
  [ToolAuthenticationTypeEnum.ApiKeyHeader]: "API key (header)",
  [ToolAuthenticationTypeEnum.ApiKeyQuery]: "API key (query)",
  [ToolAuthenticationTypeEnum.Bearer]: "Bearer token",
  [ToolAuthenticationTypeEnum.Basic]: "Basic authentication",
};
