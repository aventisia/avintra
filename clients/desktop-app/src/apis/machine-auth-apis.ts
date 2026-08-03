import type {
  MachineAuthRequest,
  MachineAuthResponse,
  ServiceResponse,
} from "./machine-auth-dto";

const LS_BASE_URL_KEY = "aventisia:baseUrl";

/**
 * Resolves the Workspace API base URL from the stored service URL.
 * Falls back to the development base URL when none is configured.
 */
const getWorkspaceApiBaseUrl = (): string => {
  const storedBaseUrl = localStorage.getItem(LS_BASE_URL_KEY);
  if (storedBaseUrl) {
    return `${storedBaseUrl.replace(/\/+$/, "")}/workspace/api`;
  }
  const viteBaseUrl = import.meta.env.VITE_BASE_URL as string | undefined;
  if (viteBaseUrl) {
    return `${viteBaseUrl.replace(/\/+$/, "")}/workspace/api`;
  }
  return "/workspace/api";
};

/**
 * Posts the machine auth payload to the given Workspace API route.
 * Supports both JWT (cookie-based) and API-key (header-based) authentication.
 */
const postMachineAuth = async (
  route: "register" | "validate",
  payload: MachineAuthRequest,
  options?: { apiKey?: string; tenantId?: string },
): Promise<ServiceResponse<MachineAuthResponse>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.apiKey) {
    headers["X-API-KEY"] = options.apiKey;
  }
  if (options?.tenantId) {
    headers["X-TENANT-ID"] = options.tenantId;
  }

  const response = await fetch(`${getWorkspaceApiBaseUrl()}/machine-auth/${route}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ServiceResponse<MachineAuthResponse>;

  if (!response.ok || body.data == null) {
    const message = body?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
};

/**
 * Registers the machine with the Workspace API and returns a JWT for its linked user account.
 */
export const registerMachine = (
  payload: MachineAuthRequest,
  options?: { apiKey?: string; tenantId?: string },
): Promise<ServiceResponse<MachineAuthResponse>> =>
  postMachineAuth("register", payload, options);

/**
 * Validates a registered machine and returns a JWT for its linked user account.
 */
export const validateMachine = (
  payload: MachineAuthRequest,
  options?: { apiKey?: string; tenantId?: string },
): Promise<ServiceResponse<MachineAuthResponse>> =>
  postMachineAuth("validate", payload, options);
