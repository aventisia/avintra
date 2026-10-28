import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { useNavigate } from "react-router-dom";

import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useFetchVersionHistoryList } from "@/features/version-history/hooks/useFetchVersionHistoryList";
import { useCarryParams } from "@/features/version-history/hooks/useForwardQueryParams";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

export const StudioViewSwitch = () => {
  const withQueryParams = useCarryParams(["f", "v", "return"]);
  const navigate = useNavigate();
  const { data } = useFetchVersionHistoryList();
  const isAgentHistory = useIsVersionHistoryRoute();
  const isExecutionLog = useIsExecutionLogsRoute();

  const views = [
    { label: "Canvas", path: "/agent", isActive: !isAgentHistory && !isExecutionLog },
    { label: "Runs", path: "/execution-log", isActive: isExecutionLog },
    { label: "Versions", path: "/agent-history", isActive: isAgentHistory },
  ];

  const openView = (path: string) => {
    if (path === "/agent-history" && !data?.data?.length) {
      toast.info("No change history present");
      return;
    }
    navigate(withQueryParams(path));
  };

  return (
    <div
      role="tablist"
      aria-label="Studio view"
      className="hidden gap-0.5 rounded-md border border-line bg-sunken p-0.5 md:inline-flex"
    >
      {views.map((view) => (
        <button
          key={view.path}
          type="button"
          role="tab"
          aria-selected={view.isActive}
          onClick={() => !view.isActive && openView(view.path)}
          className={cn(
            "inline-flex h-[22px] items-center rounded-sm px-2.5 text-[12.5px]/[18px] font-semibold text-muted-foreground hover:text-ink focus-visible:shadow-focus focus-visible:outline-none",
            view.isActive && "bg-fill text-ink shadow-[0_0_0_1px_var(--line-strong)]",
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};
