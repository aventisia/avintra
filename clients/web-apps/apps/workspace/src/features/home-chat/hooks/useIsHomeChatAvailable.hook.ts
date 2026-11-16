import { useBaseLayoutStore } from "@avplatform/ui/stores";

import { ROLE_SA } from "@/constants/roles";

/** Whether a selected role other than super admin can use Home. */
export const useIsHomeChatAvailable = () =>
  useBaseLayoutStore((state) => state.selectedRoles.some((role) => role !== ROLE_SA));
