import { createAssistantUIModelAdapter } from "@avplatform/assistant-chat/model-adapter";
import { describe, expect, it, vi } from "vitest";

const { streamChatCompletion } = vi.hoisted(() => ({ streamChatCompletion: vi.fn() }));

vi.mock("../../../../assistant-chat/src/apis/streaming-chat-apis", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  streamChatCompletion,
}));

const frame = (type: string, output: unknown) => JSON.stringify({ type, output });

const userMessage = {
  id: "u1",
  role: "user",
  content: [{ type: "text", text: "Hi" }],
  attachments: [],
  createdAt: new Date(),
  metadata: { custom: {} },
};

const runToEnd = async (releaseRunAtDone: boolean, callbacks: Record<string, () => void>) => {
  const adapter = createAssistantUIModelAdapter({
    getConversationId: async () => "c1",
    releaseRunAtDone,
    ...callbacks,
  });
  const run = adapter.run({
    messages: [userMessage],
    abortSignal: new AbortController().signal,
  } as never) as AsyncGenerator<unknown>;
  while (!(await run.next()).done);
};

describe("model adapter released at done", () => {
  it("reports the turn finished only once the stream closes", async () => {
    let closeStream!: () => void;
    const streamClosed = new Promise<void>((resolve) => (closeStream = resolve));
    streamChatCompletion.mockImplementation(async function* () {
      yield frame("delta", "Hi");
      yield frame("done", "Hi");
      await streamClosed;
      yield frame("followup", ["A"]);
    });
    const onTextComplete = vi.fn();
    const onRunFinished = vi.fn();
    const onSuggestionsUpdate = vi.fn();

    await runToEnd(true, { onTextComplete, onRunFinished, onSuggestionsUpdate });

    expect(onTextComplete).not.toHaveBeenCalled();
    expect(onRunFinished).not.toHaveBeenCalled();
    closeStream();
    await vi.waitFor(() => expect(onRunFinished).toHaveBeenCalledOnce());
    expect(onTextComplete).toHaveBeenCalledWith("Hi");
    expect(onSuggestionsUpdate).toHaveBeenCalledWith(["A"]);
  });

  it("reports the turn finished with the run when not released", async () => {
    streamChatCompletion.mockImplementation(async function* () {
      yield frame("done", "Hi");
    });
    const onTextComplete = vi.fn();
    const onRunFinished = vi.fn();

    await runToEnd(false, { onTextComplete, onRunFinished });

    expect(onTextComplete).toHaveBeenCalledOnce();
    expect(onRunFinished).toHaveBeenCalledOnce();
  });
});
