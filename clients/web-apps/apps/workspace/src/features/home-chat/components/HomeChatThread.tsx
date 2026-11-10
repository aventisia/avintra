import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { type ChatModelSelection } from "@avplatform/assistant-chat";
import { ChatModelPicker, ChatThread } from "@avplatform/chat";
import { useBranding } from "@avplatform/ui/hooks";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useHomeChatDestinations } from "../hooks/useHomeChatDestinations.hook";
import { useHomeChatModels } from "../hooks/useHomeChatModels.hook";
import { useHomeChatRuntime } from "../hooks/useHomeChatRuntime.hook";
import { useHomeChatStarters } from "../hooks/useHomeChatStarters.hook";
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

  const destinations = useHomeChatDestinations();
  const destinationsRef = useRef(destinations);
  destinationsRef.current = destinations;
  const starters = useHomeChatStarters(destinations);
  const navigate = useNavigate();

  const runtime = useHomeChatRuntime({
    ...props,
    getModelSelection: () => modelSelectionRef.current,
    getDestinations: () =>
      destinationsRef.current.map(({ route, label, section }) => ({
        route,
        label: `${section} › ${label}`,
      })),
  });
  const { companyName } = useBranding();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatThread
        placeholder={`Ask ${companyName ?? "anything"}…`}
        welcome={<HomeChatWelcome />}
        starters={starters}
        destinations={destinations}
        onNavigate={navigate}
        composerTools={
          groups.length > 0 && (
            <ChatModelPicker groups={groups} value={modelKey} onChange={selectModel} />
          )
        }
      />
    </AssistantRuntimeProvider>
  );
};
