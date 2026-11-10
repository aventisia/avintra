import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { type ChatModelSelection } from "@avplatform/assistant-chat";
import { ChatModelPicker, ChatThread } from "@avplatform/chat";
import { useBranding } from "@avplatform/ui/hooks";
import { useRef, useState } from "react";

import { HOME_CHAT_STARTERS } from "../constants/home-chat-starters.constant";
import { useHomeChatModels } from "../hooks/useHomeChatModels.hook";
import { useHomeChatRuntime } from "../hooks/useHomeChatRuntime.hook";
import { HomeChatWelcome } from "./HomeChatWelcome";

type HomeChatThreadProps = {
  conversationId?: string;
  onConversationCreated: (conversationId: string) => void;
  onConversationMissing: () => void;
};

/** One Home conversation, from its first message or its saved history. */
export const HomeChatThread = (props: HomeChatThreadProps) => {
  const { models, groups } = useHomeChatModels();
  const [modelKey, setModelKey] = useState<string | null>(null);
  const modelSelectionRef = useRef<ChatModelSelection | null>(null);
  const selectModel = (key: string | null) => {
    const model = models.find((option) => option.key === key);
    setModelKey(model ? key : null);
    modelSelectionRef.current = model
      ? {
          provider: model.provider,
          model: model.modelId,
          credentialName: model.credentialName ?? undefined,
          isByokEnabled: model.isByokEnabled,
        }
      : null;
  };

  const runtime = useHomeChatRuntime({
    ...props,
    getModelSelection: () => modelSelectionRef.current,
  });
  const { companyName } = useBranding();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatThread
        placeholder={`Ask ${companyName ?? "anything"}…`}
        welcome={<HomeChatWelcome />}
        starters={HOME_CHAT_STARTERS}
        composerTools={
          groups.length > 0 && (
            <ChatModelPicker groups={groups} value={modelKey} onChange={selectModel} />
          )
        }
      />
    </AssistantRuntimeProvider>
  );
};
