import type { UiBuilderChatMessage } from "../components/UiBuilderChatPanel";
import type { UiBuilderVersionDto } from "../dtos/ui-builder-dto";

/** Maximum number of chat messages kept per user and project. */
export const UI_BUILDER_CHAT_HISTORY_LIMIT = 200;

/** Persisted chat transcript for one user and project. */
export type UiBuilderChatHistory = {
  version: 1;
  messages: UiBuilderChatMessage[];
  clearedThroughVersion: number;
};

const CHAT_STORAGE_PREFIX = "studio-ui-builder-chat";

const chatStorageKey = (userEmail: string, projectId: string) =>
  `${CHAT_STORAGE_PREFIX}:${userEmail}:${projectId}`;

const derivedMessageId = (versionNumber: number, role: UiBuilderChatMessage["role"]) =>
  `ui-builder-chat-v${versionNumber}-${role}`;

const derivedVersionFromId = (id: string): number | null => {
  const match = /^ui-builder-chat-v(\d+)-(?:user|assistant)$/.exec(id);
  return match ? Number(match[1]) : null;
};

/**
 * Text of the assistant acknowledgement shown when a generation is saved as a version.
 */
export const getUiBuilderSaveAckText = (versionNumber?: number): string =>
  versionNumber ? `Done. Saved as version v${versionNumber}.` : "Done. The version was saved.";

const isChatMessage = (value: unknown): value is UiBuilderChatMessage => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || typeof candidate.text !== "string") return false;
  if (candidate.role !== "user" && candidate.role !== "assistant") return false;
  if (
    candidate.status !== undefined &&
    candidate.status !== "streaming" &&
    candidate.status !== "error"
  ) {
    return false;
  }

  return true;
};

const normalizePersistedMessages = (messages: UiBuilderChatMessage[]): UiBuilderChatMessage[] =>
  messages.map((message) =>
    message.status === "streaming"
      ? { ...message, text: "Generation stopped.", status: "error" }
      : message,
  );

const pairSignature = (user: UiBuilderChatMessage, assistant: UiBuilderChatMessage) =>
  `${user.role}\u0000${user.text}\u0000${assistant.role}\u0000${assistant.text}`;

const derivedPairSignatures = (messages: UiBuilderChatMessage[]): Set<string> => {
  const signatures = new Set<string>();

  for (let index = 0; index + 1 < messages.length; index += 1) {
    const user = messages[index];
    const assistant = messages[index + 1];
    if (user.role === "user" && assistant.role === "assistant") {
      signatures.add(pairSignature(user, assistant));
      index += 1;
    }
  }

  return signatures;
};

/**
 * Reads the persisted chat history for a user and project, or null when absent or corrupt.
 */
export const getUiBuilderChatHistory = (
  userEmail: string,
  projectId: string,
): UiBuilderChatHistory | null => {
  if (!projectId) return null;

  try {
    const raw = window.localStorage.getItem(chatStorageKey(userEmail, projectId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Record<string, unknown>;
    if (candidate.version !== 1 || !Array.isArray(candidate.messages)) return null;
    if (
      typeof candidate.clearedThroughVersion !== "number" ||
      !Number.isFinite(candidate.clearedThroughVersion)
    ) {
      return null;
    }
    if (candidate.messages.length > UI_BUILDER_CHAT_HISTORY_LIMIT) return null;
    if (!candidate.messages.every(isChatMessage)) return null;

    return {
      version: 1,
      messages: candidate.messages as UiBuilderChatMessage[],
      clearedThroughVersion: candidate.clearedThroughVersion,
    };
  } catch {
    return null;
  }
};

/**
 * Persists the chat history for a user and project, keeping only the newest messages.
 */
export const saveUiBuilderChatHistory = (
  userEmail: string,
  projectId: string,
  history: UiBuilderChatHistory,
): void => {
  if (!projectId) return;

  const envelope: UiBuilderChatHistory = {
    version: 1,
    messages: history.messages.slice(-UI_BUILDER_CHAT_HISTORY_LIMIT),
    clearedThroughVersion: history.clearedThroughVersion,
  };

  try {
    window.localStorage.setItem(chatStorageKey(userEmail, projectId), JSON.stringify(envelope));
  } catch {
    // IMPORTANT NOTE: localStorage writes are best-effort; quota or private-mode failures must not break the builder.
  }
};

/**
 * Empties the chat history for a user and project, hiding versions up to the given watermark.
 */
export const clearUiBuilderChatHistory = (
  userEmail: string,
  projectId: string,
  clearedThroughVersion: number,
): void => {
  saveUiBuilderChatHistory(userEmail, projectId, {
    version: 1,
    messages: [],
    clearedThroughVersion,
  });
};

/**
 * Rebuilds the durable chat baseline from a project's saved versions, oldest first.
 */
export const deriveUiBuilderHistory = (versions: UiBuilderVersionDto[]): UiBuilderChatMessage[] =>
  [...versions]
    .sort((left, right) => left.versionNumber - right.versionNumber)
    .flatMap((version) => [
      {
        id: derivedMessageId(version.versionNumber, "user"),
        role: "user" as const,
        text: version.promptText,
      },
      {
        id: derivedMessageId(version.versionNumber, "assistant"),
        role: "assistant" as const,
        text: getUiBuilderSaveAckText(version.versionNumber),
      },
    ]);

/**
 * Merges the derived baseline with the persisted transcript, dropping duplicates and stopping stale turns.
 */
export const mergeUiBuilderHistory = (
  derived: UiBuilderChatMessage[],
  persisted: UiBuilderChatMessage[],
  clearedThroughVersion: number,
): UiBuilderChatMessage[] => {
  const visibleDerived = derived.filter((message) => {
    const versionNumber = derivedVersionFromId(message.id);
    return versionNumber === null || versionNumber > clearedThroughVersion;
  });

  const signatures = derivedPairSignatures(derived);
  const normalized = normalizePersistedMessages(persisted);
  const surplus: UiBuilderChatMessage[] = [];

  for (let index = 0; index < normalized.length; index += 1) {
    const current = normalized[index];
    const next = normalized[index + 1];
    if (
      current.role === "user" &&
      next?.role === "assistant" &&
      signatures.has(pairSignature(current, next))
    ) {
      index += 1;
      continue;
    }
    surplus.push(current);
  }

  return [...visibleDerived, ...surplus];
};
