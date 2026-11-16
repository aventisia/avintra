/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Rebuilds assistant-ui thread messages from the persisted conversation rows.
 *
 * The backend stores one row per LangChain message (assistant text, tool
 * results) plus one UI transcript row per streamed turn. Consecutive non-user
 * rows form a single assistant message; when that group carries transcript
 * frames they are replayed to recreate the exact structured content, otherwise
 * the group falls back to its assistant text (turns recorded before the
 * transcript existed).
 */
import type { ThreadMessageLike } from "@assistant-ui/react";

import { type NormalizedChatFrame, buildContentPartsFromFrames } from "./content-parts";

/** Structural subset of the persisted conversation message DTO. */
export type ConversationMessageLike = {
  id?: string;
  content: string;
  role: string;
  metadata?: Record<string, unknown> | null;
  createdOn?: Date | string;
};

const TRANSCRIPT_KEY = "ui_transcript";

const roleOf = (message: ConversationMessageLike): string => (message.role || "").toLowerCase();

const metadataOf = (message: ConversationMessageLike): Record<string, unknown> => {
  const metadata = message.metadata;
  return metadata && typeof metadata === "object" ? metadata : {};
};

const toDate = (message: ConversationMessageLike | undefined, fallback: number): Date => {
  if (message?.createdOn) {
    const parsed = new Date(message.createdOn);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(fallback);
};

/** Groups persisted rows into user/assistant thread messages. */
export function groupConversationMessages(
  messages: readonly ConversationMessageLike[],
): ThreadMessageLike[] {
  const result: ThreadMessageLike[] = [];
  let group: ConversationMessageLike[] = [];

  const flush = () => {
    if (group.length === 0) return;
    const first = group[0];

    const frames: NormalizedChatFrame[] = [];
    const decisions: Record<string, string> = {};
    const fallbackText: string[] = [];
    let feedback: unknown;

    for (const message of group) {
      const metadata = metadataOf(message);
      feedback ??= metadata.feedback;
      if (metadata[TRANSCRIPT_KEY] === true) {
        if (Array.isArray(metadata.frames)) {
          frames.push(...(metadata.frames as NormalizedChatFrame[]));
        }
        if (metadata.decisions && typeof metadata.decisions === "object") {
          Object.assign(decisions, metadata.decisions as Record<string, string>);
        }
      } else if (roleOf(message) === "assistant" && message.content) {
        // Legacy turns keep their plain text; tool/system rows are never
        // surfaced as assistant prose.
        fallbackText.push(message.content);
      }
    }

    const content: any[] =
      frames.length > 0
        ? buildContentPartsFromFrames(frames, decisions)
        : [{ type: "text", text: fallbackText.join("\n\n") }];

    result.push({
      id: first.id ?? `assistant-${result.length}`,
      role: "assistant",
      status: { type: "complete", reason: "unknown" },
      metadata:
        feedback === "positive" || feedback === "negative"
          ? { submittedFeedback: { type: feedback } }
          : {},
      content,
      createdAt: toDate(first, result.length),
    } as ThreadMessageLike);

    group = [];
  };

  messages.forEach((message) => {
    if (roleOf(message) === "user") {
      flush();
      result.push({
        id: message.id ?? `user-${result.length}`,
        role: "user",
        content: [{ type: "text", text: message.content }],
        attachments: [],
        metadata: { custom: {} },
        createdAt: toDate(message, result.length),
      } as ThreadMessageLike);
    } else {
      group.push(message);
    }
  });
  flush();

  return result;
}
