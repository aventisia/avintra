import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants";

import {
  AssistantRuntimeProvider,
  ThreadMessageLike,
  useLocalRuntime,
} from "@assistant-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import { createAssistantUIModelAdapter } from "../adapters/create-assistant-ui-model-adapter";
import { createHistoryAdapter } from "../adapters/history-adaptor";
import { useThreadConfigStore } from "../stores/assitant-ui-store";
import { Thread } from "./thread";

type WorcAssistantUIProps = {
  title?: string;
  description?: string;
  archived?: boolean;
  readOnly?: boolean;
  initialMessages?: readonly ThreadMessageLike[];
};

export const WorcAssistantUI = ({
  title,
  description,
  archived = false,
  readOnly = false,
  initialMessages = [],
}: WorcAssistantUIProps) => {
  const queryClient = useQueryClient();

  // Extract flowVersionId to pass to the execution adapter
  const { conversationId, flowVersionId } = useParams();

  // Sync props into the store whenever they change
  const setConfig = useThreadConfigStore((s) => s.setConfig);
  useEffect(() => {
    setConfig({ readOnly, archived });
  }, [readOnly, archived, setConfig]);

  const historyAdapter = useMemo(() => {
    if (readOnly) return;
    return createHistoryAdapter(conversationId ?? "", flowVersionId ?? "");
  }, [conversationId, flowVersionId, readOnly]);

  // Create a memoized Assistant UI runtime adapter for the execution flow context.
  const runtime = useLocalRuntime(
    useMemo(
      () =>
        createAssistantUIModelAdapter({
          flowVersionId: flowVersionId ?? "",
          conversationId: conversationId,
          onRequestComplete: () => {
            queryClient.invalidateQueries({ queryKey: AC_QUERY_KEY });
          },
        }),
      [flowVersionId, conversationId, queryClient],
    ),
    {
      initialMessages,
      adapters: {
        ...(!readOnly ? { history: historyAdapter } : {}),
      },
    },
  );

  return (
    // Use conversationId as a key to force re-mounting and state clearing when switching chats
    <AssistantRuntimeProvider key={conversationId} runtime={runtime}>
      <div className="flex h-full flex-col w-full">
        <Thread title={title} description={description} />
      </div>
    </AssistantRuntimeProvider>
  );
};
