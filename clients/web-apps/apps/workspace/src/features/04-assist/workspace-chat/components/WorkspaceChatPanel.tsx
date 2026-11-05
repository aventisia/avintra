import { type ChatModelSelection } from "@avplatform/assistant-chat";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { insertConversation } from "@/react-toolkit/features/av-platform-assistant-ui/apis/assist-conversations-apis";
import { AvPlatformAssistantUI } from "@/react-toolkit/features/av-platform-assistant-ui/components/AvPlatformAssistantUI";

import {
  LANDING_CONVERSATIONS_KEY,
  useLandingConversations,
} from "../hooks/useLandingConversations.hook";
import { useWorkspaceChatModels } from "../hooks/useWorkspaceChatModels.hook";
import { WorkspaceChatModelPicker } from "./WorkspaceChatModelPicker";

/**
 * Renders the landing chat thread, its model picker, and the lazy conversation allocation.
 */
export const WorkspaceChatPanel = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { archived } = useLandingConversations();
  const archivedConversations = archived.data?.data ?? [];
  const isArchived =
    Boolean(conversationId) && archivedConversations.some((item) => item.id === conversationId);

  const { models, groups, isLoading } = useWorkspaceChatModels();
  // Each conversation keeps its own model choice; a new thread starts on the default.
  const [selectedModelKeys, setSelectedModelKeys] = useState<Record<string, string | null>>({});
  const conversationKey = conversationId ?? "new";
  const selectedModelKey = selectedModelKeys[conversationKey] ?? null;
  const setSelectedModelKey = (modelKey: string | null) =>
    setSelectedModelKeys((previous) => ({ ...previous, [conversationKey]: modelKey }));
  const selectedModel = models.find((model) => model.key === selectedModelKey) ?? null;

  const modelSelectionRef = useRef<ChatModelSelection | null>(null);
  useEffect(() => {
    modelSelectionRef.current = selectedModel
      ? {
          provider: selectedModel.provider,
          model: selectedModel.modelId,
          credentialName: selectedModel.credentialName ?? undefined,
          isByokEnabled: selectedModel.isByokEnabled,
        }
      : null;
  }, [selectedModel]);

  const getModelSelection = useCallback(() => modelSelectionRef.current, []);

  const allocateConversation = useCallback(async () => {
    const response = await insertConversation();
    return response.data?.id;
  }, []);

  const handleConversationAllocated = useCallback(
    (newConversationId: string) => {
      // Carry the pick made before the thread existed to its new id.
      setSelectedModelKeys((previous) => ({
        ...previous,
        [newConversationId]: previous.new ?? null,
      }));
      queryClient.invalidateQueries({ queryKey: LANDING_CONVERSATIONS_KEY });
      navigate(`/assist/chat/${newConversationId}`, { replace: true });
    },
    [navigate, queryClient],
  );

  return (
    <AvPlatformAssistantUI
      title={`Hello${userSession?.firstName ? `, ${userSession.firstName}` : ""}`}
      description="Ask anything, or describe the interface you want to build."
      conversationId={conversationId}
      archived={isArchived}
      allocateConversation={allocateConversation}
      getModelSelection={getModelSelection}
      onConversationAllocated={handleConversationAllocated}
      composerAccessory={
        <WorkspaceChatModelPicker
          groups={groups}
          selectedModel={selectedModel}
          onSelect={setSelectedModelKey}
          isLoading={isLoading}
        />
      }
    />
  );
};
