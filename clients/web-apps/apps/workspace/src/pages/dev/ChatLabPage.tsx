import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import {
  type ChatModelGroup,
  ChatModelPicker,
  ChatThread,
  createChatAttachmentAdapter,
  withAttachmentText,
} from "@avplatform/chat";
import { useState } from "react";

import { HomeChatWelcome } from "@/features/home-chat/components/HomeChatWelcome";
import { HOME_CHAT_STARTERS } from "@/features/home-chat/constants/home-chat-starters.constant";
import { chatLabAdapter } from "@/features/home-chat/utils/chat-lab-adapter.util";

const LAB_MODEL_GROUPS: readonly ChatModelGroup[] = [
  {
    label: "OpenAI",
    models: [
      { key: "openai::gpt-4.1", label: "gpt-4.1" },
      { key: "openai::gpt-4.1-mini", label: "gpt-4.1-mini" },
    ],
  },
  { label: "Anthropic", models: [{ key: "anthropic::claude-sonnet", label: "claude-sonnet" }] },
];

const labAdapter = withAttachmentText(chatLabAdapter);
const labAttachments = createChatAttachmentAdapter();

/** Dev-only playground: the Home thread against scripted streams, no backend or login. */
export const ChatLabPage = () => {
  const runtime = useLocalRuntime(labAdapter, { adapters: { attachments: labAttachments } });
  const [modelKey, setModelKey] = useState<string | null>(null);
  return (
    <div className="h-dvh">
      <AssistantRuntimeProvider runtime={runtime}>
        <ChatThread
          placeholder="Try “markdown”, “code”, “agent”, “approve”, “long” or “error”…"
          welcome={<HomeChatWelcome />}
          starters={HOME_CHAT_STARTERS}
          composerTools={
            <ChatModelPicker groups={LAB_MODEL_GROUPS} value={modelKey} onChange={setModelKey} />
          }
        />
      </AssistantRuntimeProvider>
    </div>
  );
};
