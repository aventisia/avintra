import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDeferredDeleteQueue, omitHidden } from "../deferred-delete-queue.util";

const entry = (ids: string[], commit: () => Promise<unknown> = async () => true) => ({
  ids,
  commit: vi.fn(commit),
  sendOnLeave: vi.fn(),
  onFailure: vi.fn(),
  onSettled: vi.fn(),
});

describe("deferred delete queue", () => {
  let leaveTarget: EventTarget;
  let queue: ReturnType<typeof createDeferredDeleteQueue>;

  beforeEach(() => {
    vi.useFakeTimers();
    leaveTarget = new EventTarget();
    queue = createDeferredDeleteQueue({ delayMs: 8000, leaveTarget });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hides ids as soon as a delete is scheduled", () => {
    const remove = entry(["a", "b"]);
    queue.schedule(remove);

    expect(queue.getHiddenIds().has("a")).toBe(true);
    expect(queue.getHiddenIds().has("b")).toBe(true);
    expect(remove.commit).not.toHaveBeenCalled();
  });

  it("commits after the delay", () => {
    const remove = entry(["a"]);
    queue.schedule(remove);

    vi.advanceTimersByTime(7999);
    expect(remove.commit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(remove.commit).toHaveBeenCalledOnce();
  });

  it("undo cancels the delete and shows the ids again", () => {
    const remove = entry(["a"]);
    const listener = vi.fn();
    queue.subscribe(listener);
    const undo = queue.schedule(remove);
    listener.mockClear();

    undo();
    vi.advanceTimersByTime(8000);

    expect(remove.commit).not.toHaveBeenCalled();
    expect(queue.getHiddenIds().has("a")).toBe(false);
    expect(listener).toHaveBeenCalled();
  });

  it("ignores undo once committed", () => {
    const undo = queue.schedule(entry(["a"]));

    vi.advanceTimersByTime(8000);
    undo();

    expect(queue.getHiddenIds().has("a")).toBe(true);
  });

  it("keeps ids hidden after a successful commit", async () => {
    const remove = entry(["a"]);
    queue.schedule(remove);

    await vi.advanceTimersByTimeAsync(8000);

    expect(remove.onSettled).toHaveBeenCalledOnce();
    expect(remove.onFailure).not.toHaveBeenCalled();
    expect(queue.getHiddenIds().has("a")).toBe(true);
  });

  it("shows the ids again when the commit fails", async () => {
    const remove = entry(["a"], async () => {
      throw new Error("500");
    });
    queue.schedule(remove);

    await vi.advanceTimersByTimeAsync(8000);

    expect(remove.onFailure).toHaveBeenCalledOnce();
    expect(remove.onSettled).toHaveBeenCalledOnce();
    expect(queue.getHiddenIds().has("a")).toBe(false);
  });

  it("sends pending deletes when the page is hidden", () => {
    const remove = entry(["a"]);
    queue.schedule(remove);

    leaveTarget.dispatchEvent(new Event("pagehide"));
    vi.advanceTimersByTime(8000);

    expect(remove.sendOnLeave).toHaveBeenCalledOnce();
    expect(remove.commit).not.toHaveBeenCalled();
    expect(queue.getHiddenIds().has("a")).toBe(true);
  });

  it("does not resend a delete already committed", () => {
    const remove = entry(["a"]);
    queue.schedule(remove);

    vi.advanceTimersByTime(8000);
    leaveTarget.dispatchEvent(new Event("pagehide"));

    expect(remove.sendOnLeave).not.toHaveBeenCalled();
  });

  it("runs each delete on its own timer", () => {
    const first = entry(["a"]);
    const second = entry(["b"]);
    const undoFirst = queue.schedule(first);
    vi.advanceTimersByTime(3000);
    queue.schedule(second);
    vi.advanceTimersByTime(2000);
    undoFirst();

    vi.advanceTimersByTime(6000);

    expect(first.commit).not.toHaveBeenCalled();
    expect(second.commit).toHaveBeenCalledOnce();
  });

  it("keeps the same hidden set until it changes", () => {
    queue.schedule(entry(["a"]));

    expect(queue.getHiddenIds()).toBe(queue.getHiddenIds());
  });

  it("omitHidden drops hidden items", () => {
    expect(omitHidden([{ id: "a" }, { id: "b" }], new Set(["a"]))).toEqual([{ id: "b" }]);
  });
});
