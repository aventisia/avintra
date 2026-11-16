// import { DotSeparator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useShallow } from "zustand/react/shallow";

const TenantSwitchBadge = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  return (
    <Badge variant="outline" className="ml-2">
      <Tooltip content={userSession?.tenantName}>
        <p className="flex items-center  text-xs font-semibold text-primary-text">
          <span className="text-warn">Viewing</span>
          <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground mx-2" />
          <span className="truncate text-2xs max-w-28">{userSession?.tenantName}</span>
        </p>
      </Tooltip>
    </Badge>
  );
};

export { TenantSwitchBadge };
