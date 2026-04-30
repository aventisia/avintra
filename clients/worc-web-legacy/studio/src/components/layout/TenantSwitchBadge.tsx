import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

// import { DotSeparator } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { Tooltip } from "@aventisia/ui/tooltip";
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
      className="ml-2 border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 backdrop-blur"
    >
      <Tooltip content={userSession?.tenantName}>
        <p className="flex items-center  text-xs font-semibold text-white">
          <span className="text-orange-400">Viewing</span>
          <span className="h-0.5 w-0.5 bg-slate-500 rounded-full mx-2"/><span className="truncate text-2xs max-w-28">
            {userSession?.tenantName}
          </span>
        </p>
      </Tooltip>
    </Badge>
  );
};

export { TenantSwitchBadge };
