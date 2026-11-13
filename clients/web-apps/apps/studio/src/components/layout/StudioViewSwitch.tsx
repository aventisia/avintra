import { toast } from "@avplatform/ui/sonner";
import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@avplatform/ui/tabs";
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
    { label: "Build", path: "/agent", isActive: !isAgentHistory && !isExecutionLog },
    { label: "Runs", path: "/execution-log", isActive: isExecutionLog },
    { label: "History", path: "/agent-history", isActive: isAgentHistory },
  ];

  const openView = (path: string) => {
    if (path === "/agent-history" && !data?.data?.length) {
      toast.info("No change history present");
      return;
    }
    navigate(withQueryParams(path));
  };

  return (
    <Tabs
      value={views.find((view) => view.isActive)?.path}
      onValueChange={openView}
      className="hidden md:flex"
    >
      <TabsList aria-label="Studio view" className={SEGMENTED_TABS_LIST_CLASS}>
        {views.map((view) => (
          <TabsTrigger key={view.path} value={view.path} className={SEGMENTED_TABS_TRIGGER_CLASS}>
            {view.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
