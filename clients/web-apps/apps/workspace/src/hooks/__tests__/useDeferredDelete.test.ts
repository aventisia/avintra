import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sonner = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() },
}));
vi.mock("sonner", () => sonner);

const leaveTarget = vi.hoisted(() => {
  const target = new EventTarget();
  globalThis.window = target as Window & typeof globalThis;
  return target;
});

const { deleteWithUndo } = await import("../useDeferredDelete");

const schedule = () => {
  deleteWithUndo({
    ids: [`id-${Math.random()}`],
    message: "Chat deleted",
    failureMessage: "Couldn't delete that chat",
    commit: async () => true,
    onSettled: () => undefined,
  });
  return sonner.toast.success.mock.lastCall?.[1]?.id;
};

describe("deleteWithUndo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("closes the Undo toast once the delete is sent", async () => {
    const toastId = schedule();

    await vi.advanceTimersByTimeAsync(8000);

    expect(toastId).toBeDefined();
    expect(sonner.toast.dismiss).toHaveBeenCalledWith(toastId);
  });

  it("closes the Undo toast when the page is left", () => {
    const toastId = schedule();

    leaveTarget.dispatchEvent(new Event("pagehide"));

    expect(toastId).toBeDefined();
    expect(sonner.toast.dismiss).toHaveBeenCalledWith(toastId);
  });
});
