import { useUserSessionStore } from "@avplatform/ui/stores";

const NO_ROLES: string[] = [];

/**
 * Role flags the merged Agents page branches on: developers keep the Build view, TU holders get
 * their assigned and shared agents, and a TU-only caller gets the read-only view.
 */
export const useAgentRoles = () => {
  const userRoles = useUserSessionStore((state) => state.userSession?.userRoles ?? NO_ROLES);
  const hasTD = userRoles.includes("TD");
  const hasTU = userRoles.includes("TU");

  return { hasTD, hasTU, isTuOnly: hasTU && !hasTD };
};
