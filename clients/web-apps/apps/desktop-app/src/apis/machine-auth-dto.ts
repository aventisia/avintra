/**
 * Payload used to register or validate a machine against the Workspace API.
 */
export interface MachineAuthRequest {
  /** Operating system of the machine, e.g., Windows or Linux. */
  operatingSystem: "Windows" | "Linux";
  /** Identifier that uniquely represents the operating system. */
  osID: string;
  /** Host name of the machine. */
  hostname: string;
  /** Username of the machine. */
  username: string;
  /** Linked user account identifier: a user GUID or unique username. */
  linkedUserAccountId: string;
}

/**
 * Response returned after registering or validating a machine.
 */
export interface MachineAuthResponse {
  /** JWT issued for the linked user account of the machine. */
  jwt: string;
  /** Expiry timestamp of the issued JWT (ISO 8601). */
  expiresOn: string;
  /** Identifier of the registered machine. */
  machineId: string;
}

/**
 * Standard ServiceResponse<T> envelope used by the backend APIs.
 */
export interface ServiceResponse<T> {
  message: string | null;
  statusCode: number;
  data: T | null;
}
