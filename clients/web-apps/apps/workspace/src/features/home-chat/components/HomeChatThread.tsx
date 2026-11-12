import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { type ChatModelSelection } from "@avplatform/assistant-chat";
import { ChatModelPicker, ChatThread, toDataUrl } from "@avplatform/chat";
import { useBranding, useShowAlertHandler } from "@avplatform/ui/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  createChatArtifact,
  getChatArtifact,
} from "@/features/04-assist/workspace-chat/apis/workspace-chat.apis";

import { transcribeSpeech } from "../apis/speech.apis";
import {
  HOME_CHAT_FILES_QUERY_KEY,
  HOME_CHAT_FILE_QUERY_KEY,
} from "../constants/home-chat.constant";
import { useHomeChatCommands } from "../hooks/useHomeChatCommands.hook";
import { useHomeChatDestinations } from "../hooks/useHomeChatDestinations.hook";
import { useHomeChatFiles } from "../hooks/useHomeChatFiles.hook";
import { useHomeChatMentions } from "../hooks/useHomeChatMentions.hook";
import { useHomeChatModels } from "../hooks/useHomeChatModels.hook";
import { useHomeChatRuntime } from "../hooks/useHomeChatRuntime.hook";
import { useHomeChatStarters } from "../hooks/useHomeChatStarters.hook";
import { HomeChatPreview } from "./HomeChatPreview";
import { HomeChatWelcome } from "./HomeChatWelcome";

const PREVIEW_PARAM = "file";

type HomeChatThreadProps = {
  conversationId?: string;
  onConversationCreated: (conversationId: string) => void;
  onConversationMissing: () => void;
};

/** One Home conversation, from its first message or its saved history. */
export const HomeChatThread = (props: HomeChatThreadProps) => {
  const { models, groups, speechModel } = useHomeChatModels();
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
  const mentions = useHomeChatMentions();
  const navigate = useNavigate();
  const commands = useHomeChatCommands();

  const [searchParams, setSearchParams] = useSearchParams();
  const previewId = searchParams.get(PREVIEW_PARAM);
  const setPreviewId = (id: string | null) =>
    setSearchParams(
      (params) => {
        if (id) params.set(PREVIEW_PARAM, id);
        else params.delete(PREVIEW_PARAM);
        return params;
      },
      { replace: true },
    );
  const files = useHomeChatFiles(props.conversationId, setPreviewId);
  const preview = useQuery({
    queryKey: [...HOME_CHAT_FILE_QUERY_KEY, previewId],
    queryFn: async () => (await getChatArtifact(previewId!)).data,
    enabled: !!previewId,
  });
  const previewFile = preview.data && {
    name: preview.data.name,
    contentType: preview.data.contentType,
    sizeBytes: preview.data.sizeBytes,
    url: preview.data.blobPath.startsWith("data:") ? preview.data.blobPath : null,
  };
  const previewVersions = useMemo(
    () =>
      preview.data
        ? files.artifacts
            .filter(
              (artifact) =>
                artifact.conversationId === preview.data!.conversationId &&
                artifact.name === preview.data!.name,
            )
            .map((artifact) => ({ id: artifact.id, versionNumber: artifact.versionNumber }))
        : [],
    [files.artifacts, preview.data],
  );

  const runtime = useHomeChatRuntime({
    ...props,
    getModelSelection: () => modelSelectionRef.current,
    getDestinations: () =>
      destinationsRef.current.map(({ route, label, section }) => ({
        route,
        label: `${section} › ${label}`,
      })),
    onReplyComplete: files.refreshAfterReply,
  });
  const { companyName } = useBranding();
  const queryClient = useQueryClient();
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const { showCustomAlertDialog } = useShowAlertHandler();

  const saveVersion = async (body: string) => {
    const current = preview.data;
    if (!current || isSavingVersion) return;
    if (new Blob([body]).size > 10 * 1024 * 1024) {
      showCustomAlertDialog({
        isDestructive: false,
        title: "File too large",
        description: "Each file must be 10 MB or smaller.",
        confirmBtnText: "OK",
        confirmActionFn: () => {},
      });
      return;
    }
    setIsSavingVersion(true);
    try {
      const saved = await createChatArtifact({
        conversationId: current.conversationId,
        name: current.name,
        contentType: current.contentType,
        sizeBytes: new Blob([body]).size,
        blobPath: toDataUrl(current.contentType, body),
        sourceArtifact: null,
        origin: "Generated",
      });
      await queryClient.invalidateQueries({ queryKey: HOME_CHAT_FILES_QUERY_KEY });
      setPreviewId(saved.data.id);
    } catch {
      showCustomAlertDialog({
        isDestructive: false,
        title: "Version not saved",
        description: "The edited file could not be saved. Try again.",
        confirmBtnText: "OK",
        confirmActionFn: () => {},
      });
    } finally {
      setIsSavingVersion(false);
    }
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full min-h-0">
        <div className="min-w-0 flex-1">
          <ChatThread
            placeholder={`Ask ${companyName ?? "anything"}…`}
            welcome={<HomeChatWelcome isSavedChat={!!props.conversationId} />}
            starters={starters}
            destinations={destinations}
            onNavigate={navigate}
            files={files.handlers}
            commands={commands}
            mentions={mentions}
            transcribe={(audio) => transcribeSpeech(audio, speechModel, props.conversationId)}
            composerTools={
              groups.length > 0 && (
                <ChatModelPicker groups={groups} value={modelKey} onChange={selectModel} />
              )
            }
          />
        </div>
        {previewId && (
          <HomeChatPreview
            file={previewFile ?? null}
            versions={previewVersions}
            activeVersionId={previewId}
            onSelectVersion={setPreviewId}
            onSaveVersion={saveVersion}
            isSavingVersion={isSavingVersion}
            isLoading={preview.isLoading}
            onClose={() => setPreviewId(null)}
          />
        )}
      </div>
    </AssistantRuntimeProvider>
  );
};
