import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { Badge } from "@aventisia/ui/badge";
import { useShallow } from "zustand/react/shallow";

const TenantSwitchBadge = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  return (
    <Badge
      variant="outline"
      className="ml-3 border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 backdrop-blur"
    >
      <p className="flex items-center gap-2 text-xs font-semibold text-white">
        <span className="text-orange-400">Viewing</span>
        <span className="opacity-50">•</span>
        <span className="font-medium">{userSession?.tenantName}</span>
      </p>
    </Badge>
  );
};

export { TenantSwitchBadge };
