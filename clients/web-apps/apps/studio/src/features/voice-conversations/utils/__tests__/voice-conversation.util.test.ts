import { describe, expect, it } from "vitest";

import type { ConversationMessageDto } from "../../dtos/conversation.dto";
import { ConversationMessageSenderEnum } from "../../enums/conversation-message-sender.enum";
import type { VoiceConversationSummary } from "../../types/voice-conversation.type";
import { groupConversationsByDay, toVoiceConversationTurns } from "../voice-conversation.util";

const call = (id: string, startedAt: string): VoiceConversationSummary => ({
  id,
  title: id,
  startedAt,
  durationMs: 0,
  outcome: "completed",
});

const message = (
  id: string,
  role: ConversationMessageSenderEnum,
  content: string,
  createdOn: string,
  metadata?: Record<string, unknown>,
): ConversationMessageDto => ({
  id,
  conversationId: "conversation",
  flowVersionId: "version",
  content,
  role,
  createdOn,
  metadata,
});

describe("toVoiceConversationTurns", () => {
  it("dates every caption from its stored message", () => {
    const turns = toVoiceConversationTurns([
      message("m1", ConversationMessageSenderEnum.User, "hello", "2026-11-19T10:00:00.000Z"),
      message("m2", ConversationMessageSenderEnum.Assistant, "hi", "2026-11-19T10:00:02.000Z"),
    ]);

    expect(turns.map((turn) => turn.createdAt)).toEqual([
      "2026-11-19T10:00:00.000Z",
      "2026-11-19T10:00:02.000Z",
    ]);
  });

  it("dates a trailing tool-only turn from the last tool message", () => {
    const turns = toVoiceConversationTurns([
      message("m1", ConversationMessageSenderEnum.User, "search", "2026-11-19T10:00:00.000Z"),
      message("m2", ConversationMessageSenderEnum.Tool, "", "2026-11-19T10:00:01.000Z", {
        name: "search",
      }),
    ]);

    expect(turns[1]).toMatchObject({
      id: "tool-calls",
      createdAt: "2026-11-19T10:00:01.000Z",
    });
  });

  it("shows only the caller's words when the stored message carries injected knowledge base context", () => {
    const turns = toVoiceConversationTurns([
      message(
        "m1",
        ConversationMessageSenderEnum.User,
        "[Knowledge Base Context]\nrefunds take 30 days\n[/Knowledge Base Context]\n\nwhat is the refund policy?",
        "2026-11-19T10:00:00.000Z",
      ),
    ]);

    expect(turns).toEqual([
      {
        id: "m1",
        speaker: "caller",
        text: "what is the refund policy?",
        createdAt: "2026-11-19T10:00:00.000Z",
      },
    ]);
  });

  it("keeps an unclosed knowledge base block as the caller's words", () => {
    const turns = toVoiceConversationTurns([
      message(
        "m1",
        ConversationMessageSenderEnum.User,
        "[Knowledge Base Context]\nrefunds take 30 days",
        "2026-11-19T10:00:00.000Z",
      ),
    ]);

    expect(turns[0].text).toBe("[Knowledge Base Context]\nrefunds take 30 days");
  });

  it("keeps the knowledge base marker in an agent turn", () => {
    const turns = toVoiceConversationTurns([
      message(
        "m1",
        ConversationMessageSenderEnum.Assistant,
        "The [Knowledge Base Context] block is model-only.",
        "2026-11-19T10:00:00.000Z",
      ),
    ]);

    expect(turns[0].text).toBe("The [Knowledge Base Context] block is model-only.");
  });

  it("drops a caller row that only carried knowledge base context", () => {
    const turns = toVoiceConversationTurns([
      message(
        "m1",
        ConversationMessageSenderEnum.User,
        "[Knowledge Base Context]\nrefunds take 30 days\n[/Knowledge Base Context]",
        "2026-11-19T10:00:00.000Z",
      ),
    ]);

    expect(turns).toEqual([]);
  });

  it("carries to the assistant turn the tools it consumed", () => {
    const turns = toVoiceConversationTurns([
      message("m1", ConversationMessageSenderEnum.Tool, "", "2026-11-19T10:00:01.000Z", {
        name: "search",
      }),
      message(
        "m2",
        ConversationMessageSenderEnum.Assistant,
        "found it",
        "2026-11-19T10:00:02.000Z",
      ),
      message("m3", ConversationMessageSenderEnum.Tool, "", "2026-11-19T10:00:03.000Z", {
        name: "lookup",
      }),
    ]);

    expect(turns).toEqual([
      {
        id: "m2",
        speaker: "agent",
        text: "found it",
        createdAt: "2026-11-19T10:00:02.000Z",
        toolCalls: [{ name: "search" }],
      },
      {
        id: "tool-calls",
        speaker: "agent",
        text: "",
        createdAt: "2026-11-19T10:00:03.000Z",
        toolCalls: [{ name: "lookup" }],
      },
    ]);
  });
});

describe("groupConversationsByDay", () => {
  it("groups calls by local day, newest day and newest call first", () => {
    const morning = new Date(2026, 10, 17, 9, 0);
    const evening = new Date(2026, 10, 17, 18, 0);
    const yesterday = new Date(2026, 10, 16, 12, 0);

    const days = groupConversationsByDay([
      call("morning", morning.toISOString()),
      call("yesterday", yesterday.toISOString()),
      call("evening", evening.toISOString()),
    ]);

    expect(days.map((day) => day.date)).toEqual([evening.toDateString(), yesterday.toDateString()]);
    expect(days[0]).toMatchObject({ startedAt: evening.getTime() });
    expect(days[0].entries.map((entry) => entry.id)).toEqual(["evening", "morning"]);
    expect(days[1].entries.map((entry) => entry.id)).toEqual(["yesterday"]);
  });

  it("leaves out calls whose start time does not parse", () => {
    const days = groupConversationsByDay([
      call("broken", "not-a-date"),
      call("valid", new Date(2026, 10, 17, 9, 0).toISOString()),
    ]);

    expect(days).toHaveLength(1);
    expect(days[0].entries.map((entry) => entry.id)).toEqual(["valid"]);
  });
});
