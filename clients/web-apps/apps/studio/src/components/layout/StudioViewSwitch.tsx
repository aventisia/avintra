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
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { BUILD_PATH } from "@/constants/studio-routes.constant";
import {
  EXECUTION_LOG_PATH,
  countExecutionLogs,
  loadExecutionLogsView,
  useIsExecutionLogsRoute,
} from "@/features/execution-logs";
import {
  AGENT_HISTORY_PATH,
  countAgentHistory,
  loadAgentHistoryView,
  useIsVersionHistoryRoute,
} from "@/features/version-history";
import { useCarryParams } from "@/features/version-history/hooks/useForwardQueryParams";
import {
  VOICE_CONVERSATIONS_PATH,
  useIsVoiceConversationsRoute,
} from "@/features/voice-conversations";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

const HOVER_PRELOAD_DELAY_MS = 150;

const LOADABLE_VIEWS = {
  [EXECUTION_LOG_PATH]: {
    load: loadExecutionLogsView,
    countEntries: countExecutionLogs,
    emptyMessage: "No runs for this version yet",
  },
  [AGENT_HISTORY_PATH]: {
    load: loadAgentHistoryView,
    countEntries: countAgentHistory,
    emptyMessage: "No change history present",
  },
} as const;

type LoadableViewPath = keyof typeof LOADABLE_VIEWS;

const isLoadableView = (path: string): path is LoadableViewPath =>
  Object.hasOwn(LOADABLE_VIEWS, path);

/** Studio view tabs; a view with entries waits for its code and data before navigating, with progress shown on the tab. */
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
  // IMPORTANT NOTE: React state updates apply only after re-render, so a ref is the only lock that rejects a second click arriving in the same tick.
  const pendingRef = useRef<string | null>(null);
  const hoverTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(hoverTimerRef.current), []);

  const views = isVoiceAgent
    ? [
        { label: "Build", path: BUILD_PATH, isActive: !isAgentHistory && !isVoiceConversations },
        {
          label: "Conversations",
          path: VOICE_CONVERSATIONS_PATH,
          isActive: isVoiceConversations,
        },
        { label: "History", path: AGENT_HISTORY_PATH, isActive: isAgentHistory },
      ]
    : [
        { label: "Build", path: BUILD_PATH, isActive: !isAgentHistory && !isExecutionLog },
        { label: "Runs", path: EXECUTION_LOG_PATH, isActive: isExecutionLog },
        { label: "History", path: AGENT_HISTORY_PATH, isActive: isAgentHistory },
      ];

  const prepareView = async (path: LoadableViewPath): Promise<boolean> => {
    const view = LOADABLE_VIEWS[path];
    const [entryCount] = await Promise.all([
      view.countEntries(queryClient, searchParams),
      view.load(),
    ]);
    return entryCount === null || entryCount > 0;
  };

  const preloadView = (path: string) => {
    if (!isLoadableView(path) || pendingRef.current) return;

    const view = LOADABLE_VIEWS[path];
    void view.load().catch(() => undefined);
    void view.countEntries(queryClient, searchParams).catch(() => undefined);
  };

  const scheduleHoverPreload = (path: string) => {
    window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => preloadView(path), HOVER_PRELOAD_DELAY_MS);
  };

  const cancelHoverPreload = () => window.clearTimeout(hoverTimerRef.current);

  const openView = async (path: string) => {
    if (pendingRef.current) return;

    if (!isLoadableView(path)) {
      navigate(withQueryParams(path));
      return;
    }

    pendingRef.current = path;
    setPendingPath(path);
    try {
      const hasEntries = await prepareView(path);
      if (!hasEntries) {
        toast.info(LOADABLE_VIEWS[path].emptyMessage);
        return;
      }
      navigate(withQueryParams(path));
    } catch (error) {
      toast.error(String(error));
    } finally {
      pendingRef.current = null;
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
              onPointerEnter={() => {
                if (!view.isActive) scheduleHoverPreload(view.path);
              }}
              onPointerLeave={cancelHoverPreload}
              onFocus={() => {
                if (!view.isActive) preloadView(view.path);
              }}
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
