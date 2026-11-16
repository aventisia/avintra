import { describe, expect, it, vi } from "vitest";

import { createConversationIdAllocator } from "../conversation-id-allocator.util";

describe("createConversationIdAllocator", () => {
  it("returns the existing id without creating a conversation", async () => {
    const createConversation = vi.fn(async () => "new");
    const getConversationId = createConversationIdAllocator({
      conversationId: "existing",
      createConversation,
    });

    expect(await getConversationId(true)).toBe("existing");
    expect(createConversation).not.toHaveBeenCalled();
  });

  it("only creates a conversation when asked to allocate", async () => {
    const createConversation = vi.fn(async () => "new");
    const getConversationId = createConversationIdAllocator({ createConversation });

    expect(await getConversationId(false)).toBeUndefined();
    expect(createConversation).not.toHaveBeenCalled();
  });

  it("creates the conversation once for concurrent and later calls", async () => {
    const createConversation = vi.fn(async () => "new");
    const onConversationCreated = vi.fn();
    const getConversationId = createConversationIdAllocator({
      createConversation,
      onConversationCreated,
    });

    const ids = await Promise.all([getConversationId(true), getConversationId(true)]);

    expect(ids).toEqual(["new", "new"]);
    expect(await getConversationId(false)).toBe("new");
    expect(createConversation).toHaveBeenCalledTimes(1);
    expect(onConversationCreated).toHaveBeenCalledTimes(1);
    expect(onConversationCreated).toHaveBeenCalledWith("new");
  });

  it("retries on the next send after a failed create", async () => {
    const createConversation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce("new");
    const getConversationId = createConversationIdAllocator({ createConversation });

    await expect(getConversationId(true)).rejects.toThrow("offline");
    expect(await getConversationId(true)).toBe("new");
  });
});
