import { useBaseLayoutStore } from "@avplatform/ui/stores";

import { ROLE_SA } from "@/constants/roles";

import { isHomeChatEnabled } from "../utils/home-chat-flag.util";

/** Whether Home is enabled and a selected role other than super admin can use it. */
export const useIsHomeChatAvailable = () => {
  const hasWorkspaceRole = useBaseLayoutStore((state) =>
    state.selectedRoles.some((role) => role !== ROLE_SA),
  );
  return isHomeChatEnabled && hasWorkspaceRole;
};
