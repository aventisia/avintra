import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import {
  ChatHistory,
  type ChatHistoryItem,
  type ChatModelGroup,
  ChatModelPicker,
  ChatThread,
  createChatAttachmentAdapter,
  withAttachmentText,
} from "@avplatform/chat";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useState } from "react";

import { HomeChatFrame } from "@/features/home-chat/components/HomeChatFrame";
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

  return (
    <div className="h-dvh">
      <HomeChatFrame
        onNewChat={() => openThread()}
        renderHistory={({ close, dismissSheet }) => (
          <ChatHistory
            items={history.filter((item) =>
              item.title.toLowerCase().includes(search.trim().toLowerCase()),
            )}
            activeId={activeId}
            getHref={(id) => `#${id}`}
            onOpen={(id) => {
              dismissSheet();
              openThread(id);
            }}
            onNewChat={() => {
              dismissSheet();
              openThread();
            }}
            onRename={(id, title) =>
              setHistory((items) =>
                items.map((item) => (item.id === id ? { ...item, title } : item)),
              )
            }
            onDelete={(target) =>
              showCustomAlertDialog({
                isDestructive: true,
                title: "Delete chat?",
                description: `“${target.title}” and its messages will be deleted. This can't be undone.`,
                confirmBtnText: "Delete",
                confirmActionFn: () =>
                  setHistory((items) => items.filter((item) => item.id !== target.id)),
              })
            }
            onCollapse={close}
            search={search}
            onSearchChange={setSearch}
            isLoading={false}
            isError={false}
            onRetry={() => undefined}
            hasMore={false}
            isLoadingMore={false}
            onLoadMore={() => undefined}
          />
        )}
      >
        <LabThread key={threadKey} />
      </HomeChatFrame>
    </div>
  );
};

const LabThread = () => {
  const runtime = useLocalRuntime(labAdapter, { adapters: { attachments: labAttachments } });
  const [modelKey, setModelKey] = useState<string | null>(null);
  return (
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
  );
};
