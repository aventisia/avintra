export { createAssistantUIModelAdapter } from "./adapters/create-assistant-ui-model-adapter";
export type {
  ChatModelSelection,
  CreateAssistantUIModelAdapterParams,
} from "./adapters/create-assistant-ui-model-adapter";

export { streamApprovalDecisions, streamChatCompletion } from "./apis/streaming-chat-apis";
export type {
  ApprovalDecisionDto,
  StreamingChatApprovalRequestDto,
  StreamingChatRequestDto,
} from "./apis/streaming-chat-apis";

export { ChatToolCall } from "./components/chat-tool-call";
export type { ChatToolCallProps } from "./components/chat-tool-call";
export { ToolApprovalBulkBar } from "./components/tool-approval-bulk-bar";
export { ToolApprovalRequest } from "./components/tool-approval";
export { ThinkingIndicator } from "./components/thinking-indicator";
export type { ThinkingIndicatorProps } from "./components/thinking-indicator";

export { humanizeToolLabel } from "./lib/tool-labels";
export { getPendingApprovalParts, isPendingApprovalPart } from "./lib/approval-parts";
export type { ApprovalPartMeta, ApprovalToolCallPart } from "./lib/approval-parts";

export { buildContentPartsFromFrames, createContentPartsBuilder } from "./lib/content-parts";
export type { ContentPart, ContentPartsBuilder, NormalizedChatFrame } from "./lib/content-parts";
export { groupConversationMessages } from "./lib/conversation-messages";
export type { ConversationMessageLike } from "./lib/conversation-messages";

export { useHasPendingToolCalls, useToolCallCoordinatorStore } from "./stores/tool-call-store";
export type { ToolCallEntry } from "./stores/tool-call-store";

export type { LLMMessageType } from "./types/llm-message.type";
