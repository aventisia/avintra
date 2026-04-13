import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
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
        }),
      [flowVersionId, conversationId],
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
