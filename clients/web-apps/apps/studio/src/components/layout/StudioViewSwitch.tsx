import { LoadingSpinner } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@avplatform/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getAgentsExecutionLogs } from "@/features/execution-logs/apis/job-execution-log-apis";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { getAgentsHistory } from "@/features/version-history/apis/agents-history-apis";
import { useCarryParams } from "@/features/version-history/hooks/useForwardQueryParams";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import {
  VOICE_CONVERSATIONS_PATH,
  useIsVoiceConversationsRoute,
} from "@/features/voice-conversations";
import { loadAgentHistoryView, loadExecutionLogsView } from "@/pages/studio-view-loaders";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

const VIEW_LOADERS: Record<string, (() => Promise<unknown>) | undefined> = {
  "/execution-log": loadExecutionLogsView,
  "/agent-history": loadAgentHistoryView,
};

/** Fetches fresh data for a view and reports whether it has any entries, so the tab can stay put when empty. */
export const StudioViewSwitch = () => {
  const withQueryParams = useCarryParams(["f", "v", "return"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isAgentHistory = useIsVersionHistoryRoute();
  const isExecutionLog = useIsExecutionLogsRoute();
  const isVoiceConversations = useIsVoiceConversationsRoute();
  const isVoiceAgent = useCurrentFlowStore((state) => state.isVoiceAgent);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const views = isVoiceAgent
    ? [
        { label: "Build", path: "/agent", isActive: !isAgentHistory && !isVoiceConversations },
        {
          label: "Conversations",
          path: VOICE_CONVERSATIONS_PATH,
          isActive: isVoiceConversations,
        },
        { label: "History", path: "/agent-history", isActive: isAgentHistory },
      ]
    : [
        { label: "Build", path: "/agent", isActive: !isAgentHistory && !isExecutionLog },
        { label: "Runs", path: "/execution-log", isActive: isExecutionLog },
        { label: "History", path: "/agent-history", isActive: isAgentHistory },
      ];

  const fetchEntryCount = async (path: string): Promise<number | null> => {
    const versionId = searchParams.get("v") || "";
    if (!versionId) return null;

    if (path === "/agent-history") {
      const response = await queryClient.fetchQuery({
        queryKey: ["AGENT_HISTORY", versionId],
        queryFn: () => getAgentsHistory(versionId),
      });
      return response.data?.length ?? 0;
    }

    if (path === "/execution-log") {
      const runsVersionId = searchParams.get("rv") || versionId;
      const response = await queryClient.fetchQuery({
        queryKey: ["AGENT_JOB_EXECUTION", runsVersionId],
        queryFn: () => getAgentsExecutionLogs(runsVersionId),
      });
      return response.data?.length ?? 0;
    }

    return null;
  };

  const hasEntries = async (path: string) => {
    const count = await fetchEntryCount(path);
    return count === null || count > 0;
  };

  const preloadView = (path: string) => {
    if (pendingPath || views.find((view) => view.path === path)?.isActive) return;
    void VIEW_LOADERS[path]?.().catch(() => undefined);
    void fetchEntryCount(path).catch(() => undefined);
  };

  const openView = async (path: string) => {
    if (pendingPath) return;

    setPendingPath(path);
    try {
      const [entriesExist] = await Promise.all([hasEntries(path), VIEW_LOADERS[path]?.()]);
      if (!entriesExist) {
        toast.info(
          path === "/agent-history" ? "No change history present" : "No runs for this version yet",
        );
        return;
      }
      navigate(withQueryParams(path));
    } catch (error) {
      toast.error(String(error));
    } finally {
      setPendingPath(null);
    }
  };

  return (
    <Tabs
      value={views.find((view) => view.isActive)?.path}
      onValueChange={openView}
      className="hidden md:flex"
    >
      <TabsList
        aria-label="Studio view"
        aria-busy={pendingPath !== null}
        className={cn(SEGMENTED_TABS_LIST_CLASS, pendingPath && "cursor-progress")}
      >
        {views.map((view) => {
          const isPending = pendingPath === view.path;
          return (
            <TabsTrigger
              key={view.path}
              value={view.path}
              className={cn(SEGMENTED_TABS_TRIGGER_CLASS, isPending && "text-ink")}
              aria-disabled={pendingPath !== null}
              onPointerEnter={() => preloadView(view.path)}
              onFocus={() => preloadView(view.path)}
            >
              <span className={isPending ? "invisible" : undefined}>{view.label}</span>
              {isPending && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <LoadingSpinner className="h-3.5 w-3.5 text-primary" />
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};
