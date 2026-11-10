import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { ChatThread } from "@avplatform/chat";
import { useBranding } from "@avplatform/ui/hooks";

import { useHomeChatRuntime } from "../hooks/useHomeChatRuntime.hook";

type HomeChatThreadProps = {
  conversationId?: string;
  onConversationCreated: (conversationId: string) => void;
  onConversationMissing: () => void;
};

/** One Home conversation, from its first message or its saved history. */
export const HomeChatThread = (props: HomeChatThreadProps) => {
  const runtime = useHomeChatRuntime(props);
  const { companyName } = useBranding();
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatThread
        placeholder={`Ask ${companyName ?? "anything"}…`}
        welcome={
          <p className="text-center text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            What should we build today?
          </p>
        }
      />
    </AssistantRuntimeProvider>
  );
};
