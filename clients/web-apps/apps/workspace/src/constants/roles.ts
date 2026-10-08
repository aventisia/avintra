/**
 * Display labels for the system role codes.
 *
 * These mirror the role `FullName` values defined in the backend
 * (`AspNetToolkit/Enums/CustomRolesEnum.cs`). Keep in sync if the backend changes.
 */
export const ROLE_LABELS: Record<string, string> = {
  SA: "Super administrator",
  TA: "Tenant administrator",
  OM: "Orchestrator manager",
  TD: "Developer",
  TU: "User",
};

/** System role code for the Tenant Admin role. */
export const ROLE_TA = "TA";

/** System role code for the Orchestrator Manager role. */
export const ROLE_OM = "OM";

/**
 * Returns the human-readable label for a role code, falling back to the raw code
 * when the role is unknown.
 */
export const getRoleLabel = (role: string): string => ROLE_LABELS[role] ?? role;
