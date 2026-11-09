import { type ChatModelSelection } from "@avplatform/assistant-chat";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GroupImperativeHandle } from "react-resizable-panels";
import { useLocation, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { insertConversation } from "@/react-toolkit/features/av-platform-assistant-ui/apis/assist-conversations-apis";
import { AvPlatformAssistantUI } from "@/react-toolkit/features/av-platform-assistant-ui/components/AvPlatformAssistantUI";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import {
  createChatArtifact,
  getChatArtifacts,
} from "../apis/workspace-chat.apis";
import { type ChatArtifactDto } from "../dtos/chat-artifact.dto";
import { type InsertChatArtifactDto } from "../dtos/insert-chat-artifact.dto";

import {
  LANDING_CONVERSATIONS_KEY,
  useLandingConversations,
} from "../hooks/useLandingConversations.hook";
import { useWorkspaceChatModels } from "../hooks/useWorkspaceChatModels.hook";
import { WORKSPACE_CHAT_STARTER_SUGGESTIONS } from "../constants/workspace-chat-suggestions.constant";
import {
  WORKSPACE_CHAT_PREVIEW_PANEL_ID,
  WORKSPACE_CHAT_THREAD_PANEL_ID,
  getWorkspaceChatPreviewSplit,
  saveWorkspaceChatPreviewSplit,
} from "../utils/workspace-chat-split-persistence.util";
import { extractWorkspaceChatHtmlArtifact, stripWorkspaceChatArtifactContent } from "../utils/workspace-chat-html-artifact.util";
import {
  type WorkspaceChatAssistantArtifactMatch,
  WorkspaceChatAssistantArtifact,
} from "./WorkspaceChatAssistantArtifact";
import { WorkspaceChatModelPicker } from "./WorkspaceChatModelPicker";
import { WorkspaceChatPreviewPanel } from "./WorkspaceChatPreviewPanel";

const buildProducedArtifactKey = (conversationId: string, body: string): string =>
  `${conversationId}:${new Blob([body]).size}:${body.slice(0, 64)}`;

/**
 * Renders the landing chat thread, its model picker, and the lazy conversation allocation.
 */
export const WorkspaceChatPanel = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { archived } = useLandingConversations();
  const archivedConversations = archived.data?.data ?? [];
  // The home route carries no conversation id, so the lazily allocated id is
  // kept here and handed back down; otherwise the thread remounts empty.
  const [allocatedConversationId, setAllocatedConversationId] = useState<string | null>(null);
  const effectiveConversationId = conversationId ?? allocatedConversationId ?? undefined;
  const effectiveConversationIdRef = useRef<string | undefined>(effectiveConversationId);
  useEffect(() => {
    effectiveConversationIdRef.current = effectiveConversationId;
  }, [effectiveConversationId]);
  const isArchived =
    Boolean(effectiveConversationId) &&
    archivedConversations.some((item) => item.id === effectiveConversationId);

  const [previewArtifactId, setPreviewArtifactId] = useState<string | null>(null);
  useEffect(() => {
    setPreviewArtifactId(null);
  }, [conversationId]);

  // The header AI button navigates to "/" even when already there; a new
  // location key means the user asked for a fresh thread, so drop the lazily
  // allocated id (clearing it remounts the assistant runtime empty).
  const locationKeyRef = useRef(location.key);
  useEffect(() => {
    if (locationKeyRef.current === location.key) return;
    locationKeyRef.current = location.key;
    setAllocatedConversationId(null);
    setPreviewArtifactId(null);
  }, [location.key]);

  const userEmail = userSession?.email ?? "anonymous";
  const [initialPreviewSplit] = useState(() => getWorkspaceChatPreviewSplit(userEmail));
  const previewGroupRef = useRef<GroupImperativeHandle | null>(null);
  const wasPreviewOpenRef = useRef(false);
  useEffect(() => {
    const isOpen = previewArtifactId !== null;
    if (isOpen && !wasPreviewOpenRef.current && initialPreviewSplit) {
      try {
        previewGroupRef.current?.setLayout(initialPreviewSplit);
      } catch (error) {
        console.error("Workspace chat preview layout restore failed:", error);
      }
    }
    wasPreviewOpenRef.current = isOpen;
  }, [previewArtifactId, initialPreviewSplit]);

  const { models, groups, isLoading } = useWorkspaceChatModels();
  // Each conversation keeps its own model choice; a new thread starts on the
  // first available model so the picker names the model that will answer.
  const [selectedModelKeys, setSelectedModelKeys] = useState<Record<string, string | null>>({});
  useEffect(() => {
    if (models.length === 0) return;
    setSelectedModelKeys((previous) =>
      "new" in previous ? previous : { ...previous, new: models[0].key },
    );
  }, [models]);
  const conversationKey = effectiveConversationId ?? "new";
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

  const failedArtifactKeysRef = useRef<Set<string>>(new Set());
  const [failedArtifactCount, setFailedArtifactCount] = useState(0);
  const [artifacts, setArtifacts] = useState<ChatArtifactDto[]>([]);
  useEffect(() => {
    failedArtifactKeysRef.current.clear();
    if (!effectiveConversationId) {
      setArtifacts([]);
      return;
    }
    let live = true;
    getChatArtifacts(effectiveConversationId)
      .then((response) => {
        if (live) setArtifacts(response.data ?? []);
      })
      .catch((error) => {
        console.error("Workspace chat artifacts fetch failed:", error);
        if (live) setArtifacts([]);
      });
    return () => {
      live = false;
    };
  }, [effectiveConversationId]);

  const producedArtifactKeysRef = useRef<Set<string>>(new Set());
  const artifactsRef = useRef<ChatArtifactDto[]>(artifacts);
  useEffect(() => {
    artifactsRef.current = artifacts;
  }, [artifacts]);

  const resolveAssistantArtifact = useCallback(
    (text: string): WorkspaceChatAssistantArtifactMatch | null => {
      const derived = extractWorkspaceChatHtmlArtifact(text);
      if (!derived) return null;
      const sizeBytes = new Blob([derived.body]).size;
      const hit = artifactsRef.current.find(
        (artifact) => artifact.name === derived.name && artifact.sizeBytes === sizeBytes,
      );
      return hit
        ? { id: hit.id, name: hit.name, contentType: hit.contentType, sizeBytes: hit.sizeBytes }
        : null;
    },
    [],
  );

  const isArtifactFailed = useCallback((text: string): boolean => {
    const conversationIdForArtifact = effectiveConversationIdRef.current;
    if (!conversationIdForArtifact) return false;
    const generated = extractWorkspaceChatHtmlArtifact(text);
    if (!generated) return false;
    return failedArtifactKeysRef.current.has(
      buildProducedArtifactKey(conversationIdForArtifact, generated.body),
    );
  }, []);

  const handlePreviewArtifact = useCallback((artifactId: string) => {
    setPreviewArtifactId(artifactId);
  }, []);

  const assistantSuffix = (
    <WorkspaceChatAssistantArtifact
      resolveArtifact={resolveAssistantArtifact}
      isArtifactFailed={isArtifactFailed}
      onPreview={handlePreviewArtifact}
    />
  );

  // The fence is hidden as soon as it is detected — while streaming, while
  // saving — and the suffix holds a generating card in its place, so the raw
  // code never shows. Only a failed save keeps the code visible.
  // `artifactCount` is read so the callback identity refreshes when the store
  // updates and the memoized markdown re-renders.
  const artifactCount = artifacts.length;
  const stripArtifactText = useCallback(
    (text: string): string => {
      void artifactCount;
      void failedArtifactCount;
      if (isArtifactFailed(text)) return text;
      return stripWorkspaceChatArtifactContent(text).trim();
    },
    [isArtifactFailed, artifactCount, failedArtifactCount],
  );
  // One mid-stream store per turn so a failing or still-growing fence can never
  // turn every delta into its own POST and trip the API rate limiter; the
  // end-of-turn call below is the single backstop.
  const midStreamInsertAttemptedRef = useRef(false);
  const succeededArtifactKeysRef = useRef<Set<string>>(new Set());
  // Stores the turn's file the moment its fence is complete — mid-stream when
  // possible, so the pipeline tail and the trailing prose overlap the insert
  // instead of preceding it. Each distinct body is attempted once; the
  // end-of-run call below retries only a body that has not already been stored.
  const tryInsertArtifact = useCallback((text: string, retryFailed = false) => {
    const conversationIdForArtifact = effectiveConversationIdRef.current;
    if (!conversationIdForArtifact) return;
    const generated = extractWorkspaceChatHtmlArtifact(text);
    if (!generated) return;
    const sizeBytes = new Blob([generated.body]).size;
    if (sizeBytes === 0) return;
    const producedKey = buildProducedArtifactKey(conversationIdForArtifact, generated.body);
    if (retryFailed && succeededArtifactKeysRef.current.has(producedKey)) return;
    if (!retryFailed && producedArtifactKeysRef.current.has(producedKey)) return;
    producedArtifactKeysRef.current.add(producedKey);
    const insertDto: InsertChatArtifactDto = {
      conversationId: conversationIdForArtifact,
      name: generated.name,
      contentType: generated.contentType,
      sizeBytes,
      blobPath: `data:${generated.contentType};charset=utf-8,${encodeURIComponent(generated.body)}`,
      sourceArtifact: null,
      origin: "Generated",
    };
    createChatArtifact(insertDto)
      .then((response) => {
        if (!response.data) throw new Error("Workspace chat artifact insert returned no data.");
        setArtifacts((previous) => [...previous, response.data]);
        succeededArtifactKeysRef.current.add(producedKey);
        failedArtifactKeysRef.current.delete(producedKey);
      })
      .catch((error) => {
        console.error("Workspace chat artifact insert failed:", error);
        failedArtifactKeysRef.current.add(producedKey);
        setFailedArtifactCount((count) => count + 1);
      });
  }, []);

  const streamTextRef = useRef("");
  const handleTextDelta = useCallback(
    (delta: string) => {
      streamTextRef.current += delta;
      if (midStreamInsertAttemptedRef.current) return;
      if (!effectiveConversationIdRef.current) return;
      // A closed fence pair means the first body is final; a lone opening fence
      // is still streaming, and its body would change on every delta.
      if ((streamTextRef.current.match(/```/g) ?? []).length < 2) return;
      if (!extractWorkspaceChatHtmlArtifact(streamTextRef.current)) return;
      midStreamInsertAttemptedRef.current = true;
      tryInsertArtifact(streamTextRef.current);
    },
    [tryInsertArtifact],
  );
  const handleRunFinished = useCallback(() => {
    streamTextRef.current = "";
    midStreamInsertAttemptedRef.current = false;
  }, []);

  const handleTextComplete = useCallback(
    (text: string) => {
      tryInsertArtifact(text, true);
    },
    [tryInsertArtifact],
  );

  const allocateConversation = useCallback(async () => {
    const response = await insertConversation();
    return response.data?.id;
  }, []);

  const handleConversationAllocated = useCallback(
    (newConversationId: string) => {
      setAllocatedConversationId(newConversationId);
      // Carry the pick made before the thread existed to its new id.
      setSelectedModelKeys((previous) => ({
        ...previous,
        [newConversationId]: previous.new ?? null,
      }));
      queryClient.invalidateQueries({ queryKey: LANDING_CONVERSATIONS_KEY });
    },
    [queryClient],
  );

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      groupRef={previewGroupRef}
      onLayoutChanged={(layout, meta) => {
        if (meta.isUserInteraction && previewArtifactId)
          saveWorkspaceChatPreviewSplit(userEmail, layout);
      }}
      className="h-full w-full"
    >
      <ResizablePanel
        id={WORKSPACE_CHAT_THREAD_PANEL_ID}
        defaultSize="60%"
        minSize="30%"
        className="flex min-h-0 flex-col overflow-hidden"
      >
        <AvPlatformAssistantUI
          title={`Hello${userSession?.firstName ? `, ${userSession.firstName}` : ""}`}
          description="Ask anything, or describe the interface you want to build."
          conversationId={effectiveConversationId}
          archived={isArchived}
          allocateConversation={allocateConversation}
          getModelSelection={getModelSelection}
          onConversationAllocated={handleConversationAllocated}
          onTextComplete={handleTextComplete}
          onTextDelta={handleTextDelta}
          onRunFinished={handleRunFinished}
          centerComposerWhenEmpty
          defaultActions={WORKSPACE_CHAT_STARTER_SUGGESTIONS}
          composerAccessory={
            <WorkspaceChatModelPicker
              groups={groups}
              selectedModel={selectedModel}
              onSelect={setSelectedModelKey}
              isLoading={isLoading}
            />
          }
          assistantSuffix={assistantSuffix}
          markdownPreprocess={stripArtifactText}
        />
      </ResizablePanel>

      {previewArtifactId && (
        <>
          <ResizableHandle withHandle className="w-1 bg-transparent" />

          <ResizablePanel
            id={WORKSPACE_CHAT_PREVIEW_PANEL_ID}
            defaultSize="40%"
            minSize="25%"
            className="flex min-h-0 flex-col overflow-hidden border-l border-line"
          >
            <WorkspaceChatPreviewPanel
              artifactId={previewArtifactId}
              onClose={() => setPreviewArtifactId(null)}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
