import { useUserSessionStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { ROLE_OM } from "@/constants/roles";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";
import { useEnvironmentStore } from "@/stores/environment-store";

/** Caps PROD edit actions while retaining base permissions for visible, disabled share/delete actions. */
export const useConfigureResourceAccessActions = (accessLevel: ResourceAccessTypeEnum) => {
  const env = useEnvironmentStore((state) => state.env);
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isProd = env === "prod";
  const roles = userSession?.userRoles ?? [];
  const isOM = roles.includes(ROLE_OM);
  const resourceActions = getResourceAccessActions(accessLevel);

  const actions = isProd
    ? {
        read: true,
        update: isOM,
        delete: false,
        share: false,
      }
    : resourceActions;

  return { actions, isProd, resourceActions };
};
