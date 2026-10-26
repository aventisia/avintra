import { Badge } from "@avplatform/ui/badge";
import { useUserSessionStore } from "@avplatform/ui/stores";
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
      className="ml-3 border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur"
    >
      <p className="flex items-center gap-2 text-xs font-semibold text-primary-foreground">
        <span className="text-orange-400">Viewing</span>
        <span className="opacity-50">•</span>
        <span className="font-medium">{userSession?.tenantName}</span>
      </p>
    </Badge>
  );
};

export { TenantSwitchBadge };
