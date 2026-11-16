import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import {
  type ChatFile,
  type ChatFileHandlers,
  ChatHistory,
  type ChatHistoryItem,
  type ChatModelGroup,
  ChatModelPicker,
  ChatSidebarHistory,
  type ChatSidebarHistoryProps,
  ChatThread,
  chatFileSize,
  createChatAttachmentAdapter,
  withAttachmentText,
} from "@avplatform/chat";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getSidebarMenuBasedOnPermissions } from "@/components/layout/sidebar-menu-sections";
import { HomeChatFrame } from "@/features/home-chat/components/HomeChatFrame";
import { HomeChatPreview } from "@/features/home-chat/components/HomeChatPreview";
import { HomeChatWelcome } from "@/features/home-chat/components/HomeChatWelcome";
import { toHomeChatDestinations } from "@/features/home-chat/hooks/useHomeChatDestinations.hook";
import { useHomeChatStarters } from "@/features/home-chat/hooks/useHomeChatStarters.hook";
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

const LAB_HISTORY_TITLES = [
  ["Q3 invoice triage agent", 0],
  ["Summarize the onboarding PDF", 0],
  ["Draft a customer renewal email for Acme Corp with the new pricing tiers", 1],
  ["Spreadsheet of open support tickets", 1],
  ["Explain approval steps in Studio", 3],
  ["Slack alert when a job fails", 5],
  ["Compare GPT-4.1 and Claude for extraction", 6],
  ["Weekly KPI dashboard layout", 12],
  ["Vendor contract checklist", 30],
  ["Translate product FAQ to German", 45],
] as const;

const createLabHistory = (): ChatHistoryItem[] =>
  LAB_HISTORY_TITLES.map(([title, daysAgo], index) => ({
    id: `lab-${index}`,
    title,
    lastModifiedOn: new Date(Date.now() - daysAgo * 86_400_000 - index * 60_000).toISOString(),
  }));

const LAB_DESTINATIONS = toHomeChatDestinations(
  getSidebarMenuBasedOnPermissions(["TA", "OM", "TD", "TU"], "Enterprise"),
);

const labAdapter = withAttachmentText(chatLabAdapter);
const labAttachments = createChatAttachmentAdapter();

/** Dev-only playground: Home's frame and thread against scripted streams and fixture history, no backend or login. */
export const ChatLabPage = () => {
  const [threadKey, setThreadKey] = useState(0);
  const [history, setHistory] = useState(createLabHistory);
  const [activeId, setActiveId] = useState<string>();
  const [search, setSearch] = useState("");
  const { showCustomAlertDialog } = useShowAlertHandler();
  const openThread = (id?: string) => {
    setActiveId(id);
    setThreadKey((key) => key + 1);
  };

  const historyProps: ChatSidebarHistoryProps = {
    items: history.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase())),
    activeId,
    getHref: (id) => `#${id}`,
    onOpen: openThread,
    onRename: (id, title) =>
      setHistory((items) => items.map((item) => (item.id === id ? { ...item, title } : item))),
    onTogglePin: (target) =>
      setHistory((items) => [
        ...items
          .map((item) => (item.id === target.id ? { ...item, isPinned: !item.isPinned } : item))
          .sort((left, right) => Number(!!right.isPinned) - Number(!!left.isPinned)),
      ]),
    onDelete: (target) =>
      showCustomAlertDialog({
        isDestructive: true,
        title: "Delete chat?",
        description: `“${target.title}” and its messages will be deleted. This can't be undone.`,
        confirmBtnText: "Delete",
        confirmActionFn: () => setHistory((items) => items.filter((item) => item.id !== target.id)),
      }),
    search,
    onSearchChange: setSearch,
    isLoading: false,
    isError: false,
    onRetry: () => undefined,
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: () => undefined,
  };

  return (
    <div className="flex h-dvh">
      <aside className="hidden w-[--sidebar-max-width] shrink-0 overflow-y-auto border-r border-line bg-bg px-2.5 py-3 md:block">
        <button
          type="button"
          onClick={() => openThread()}
          className="flex h-8 w-full items-center gap-[9px] rounded-sm px-2 text-body-sm text-ink-2 hover:bg-hover hover:text-ink"
        >
          <PlusIcon className="size-4 shrink-0 stroke-[1.75] text-muted-foreground" />
          New
        </button>
        <ChatSidebarHistory {...historyProps} />
      </aside>
      <div className="min-w-0 flex-1">
        <HomeChatFrame
          onNewChat={() => openThread()}
          renderHistory={(close) => (
            <ChatHistory
              {...historyProps}
              onOpen={(id) => {
                close();
                openThread(id);
              }}
              onNewChat={() => {
                close();
                openThread();
              }}
              onCollapse={close}
            />
          )}
        >
          <LabThread key={threadKey} />
        </HomeChatFrame>
      </div>
    </div>
  );
};

const toPreviewFile = (file: ChatFile) => ({
  name: file.name,
  contentType: file.contentType,
  sizeBytes: chatFileSize(file.body),
  url: `data:${file.contentType};charset=utf-8,${encodeURIComponent(file.body)}`,
});

const LabThread = () => {
  const [labFiles] = useState(() => new Map<string, ChatFile>());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const files: ChatFileHandlers = {
    // The lab "stores" a file the moment it's complete.
    resolveFile: (file) => {
      labFiles.set(file.name, file);
      return { id: file.name };
    },
    onOpenFile: setPreviewId,
  };
  const previewFile = previewId ? labFiles.get(previewId) : undefined;
  const runtime = useLocalRuntime(labAdapter, { adapters: { attachments: labAttachments } });
  const [modelKey, setModelKey] = useState<string | null>(null);
  const starters = useHomeChatStarters(LAB_DESTINATIONS);
  const navigate = useNavigate();
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full min-h-0">
        <div className="min-w-0 flex-1">
          <ChatThread
            files={files}
            placeholder="Try “find”, “blueprint”, “html”, “code”, “agent”, “approve”, “long” or “error”…"
            welcome={<HomeChatWelcome />}
            starters={starters}
            destinations={LAB_DESTINATIONS}
            onNavigate={navigate}
            composerTools={
              <ChatModelPicker groups={LAB_MODEL_GROUPS} value={modelKey} onChange={setModelKey} />
            }
          />
        </div>
        {previewId && (
          <HomeChatPreview
            file={previewFile ? toPreviewFile(previewFile) : null}
            isLoading={false}
            onClose={() => setPreviewId(null)}
          />
        )}
      </div>
    </AssistantRuntimeProvider>
  );
};
