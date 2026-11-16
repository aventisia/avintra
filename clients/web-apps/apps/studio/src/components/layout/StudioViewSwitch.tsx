import { toast } from "@avplatform/ui/sonner";
import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@avplatform/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getAgentsExecutionLogs } from "@/features/execution-logs/apis/job-execution-log-apis";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { getAgentsHistory } from "@/features/version-history/apis/agents-history-apis";
import { useCarryParams } from "@/features/version-history/hooks/useForwardQueryParams";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

/** Fetches fresh data for a view and reports whether it has any entries, so the tab can stay put when empty. */
export const StudioViewSwitch = () => {
  const withQueryParams = useCarryParams(["f", "v", "return"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isAgentHistory = useIsVersionHistoryRoute();
  const isExecutionLog = useIsExecutionLogsRoute();

  const views = [
    { label: "Build", path: "/agent", isActive: !isAgentHistory && !isExecutionLog },
    { label: "Runs", path: "/execution-log", isActive: isExecutionLog },
    { label: "History", path: "/agent-history", isActive: isAgentHistory },
  ];

  const hasEntries = async (path: string) => {
    const versionId = searchParams.get("v") || "";
    if (!versionId) return true;

    if (path === "/agent-history") {
      const response = await queryClient.fetchQuery({
        queryKey: ["AGENT_HISTORY", versionId],
        queryFn: () => getAgentsHistory(versionId),
      });
      return (response.data?.length ?? 0) > 0;
    }

    const runsVersionId = searchParams.get("rv") || versionId;
    const response = await queryClient.fetchQuery({
      queryKey: ["AGENT_JOB_EXECUTION", runsVersionId],
      queryFn: () => getAgentsExecutionLogs(runsVersionId),
    });
    return (response.data?.length ?? 0) > 0;
  };

  const openView = async (path: string) => {
    let entriesExist: boolean;
    try {
      entriesExist = await hasEntries(path);
    } catch (error) {
      toast.error(String(error));
      return;
    }

    if (!entriesExist) {
      toast.info(
        path === "/agent-history" ? "No change history present" : "No runs for this version yet",
      );
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
