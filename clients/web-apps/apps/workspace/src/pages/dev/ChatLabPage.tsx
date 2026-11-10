import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { ChatThread } from "@avplatform/chat";

import { chatLabAdapter } from "@/features/home-chat/utils/chat-lab-adapter.util";

/** Dev-only playground: the Home thread against scripted streams, no backend or login. */
export const ChatLabPage = () => {
  const runtime = useLocalRuntime(chatLabAdapter);
  return (
    <div className="h-dvh">
      <AssistantRuntimeProvider runtime={runtime}>
        <ChatThread
          placeholder="Try “markdown”, “code”, “long” or “error”…"
          welcome={
            <p className="text-center text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
              Chat lab
            </p>
          }
        />
      </AssistantRuntimeProvider>
    </div>
  );
};
