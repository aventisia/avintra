import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { createAssistantUIModelAdapter } from "../adapters/create-assistant-ui-model-adapter";
import { createHistoryAdapter } from "../adapters/history-adaptor";
import { Thread } from "./thread";

type WorcAssistantUIProps = {
  title?: string;
  description?: string;
  archived: boolean;
};

export const WorcAssistantUI = ({
  title,
  description,
  archived,
}: WorcAssistantUIProps) => {
  const queryClient = useQueryClient();

  // Extract flowVersionId to pass to the execution adapter
  const { conversationId, flowVersionId } = useParams();

  const historyAdapter = useMemo(
    () => createHistoryAdapter(conversationId ?? "", flowVersionId ?? ""),
    [conversationId, flowVersionId],
  );

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
      adapters: {
        history: historyAdapter,
      },
    },
  );

  return (
    // Use conversationId as a key to force re-mounting and state clearing when switching chats
    <AssistantRuntimeProvider key={conversationId} runtime={runtime}>
      <div className="flex h-full flex-col w-full">
        <Thread title={title} description={description} archived={archived} />
      </div>
    </AssistantRuntimeProvider>
  );
};
