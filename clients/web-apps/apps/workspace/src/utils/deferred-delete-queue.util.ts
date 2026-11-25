/** A delete held back until its undo window ends. */
export type DeferredDelete = {
  ids: readonly string[];
  commit: () => Promise<unknown>;
  sendOnLeave: () => void;
  onFailure: () => void;
  onSettled: () => void;
};

/** Pending deletes with their undo timers and the ids lists should hide meanwhile. */
export type DeferredDeleteQueue = {
  schedule: (entry: DeferredDelete) => () => void;
  getHiddenIds: () => ReadonlySet<string>;
  subscribe: (listener: () => void) => () => void;
};

/**
 * Holds each delete for `delayMs` before committing it; the returned undo cancels it until then.
 * Pending deletes are sent at once when `leaveTarget` fires `pagehide`. Ids stay hidden unless undone or failed.
 */
export const createDeferredDeleteQueue = ({
  delayMs,
  leaveTarget,
}: {
  delayMs: number;
  leaveTarget?: EventTarget;
}): DeferredDeleteQueue => {
  const pending = new Map<
    number,
    { entry: DeferredDelete; timer: ReturnType<typeof setTimeout> }
  >();
  const hidden = new Map<string, number>();
  const listeners = new Set<() => void>();
  let hiddenIds: ReadonlySet<string> = new Set();
  let nextKey = 0;

  const publish = () => {
    hiddenIds = new Set(hidden.keys());
    listeners.forEach((listener) => listener());
  };

  const hide = (ids: readonly string[]) => {
    ids.forEach((id) => hidden.set(id, (hidden.get(id) ?? 0) + 1));
    publish();
  };

  const show = (ids: readonly string[]) => {
    ids.forEach((id) => {
      const count = (hidden.get(id) ?? 0) - 1;
      if (count > 0) hidden.set(id, count);
      else hidden.delete(id);
    });
    publish();
  };

  const commit = async (key: number) => {
    const held = pending.get(key);
    if (!held) return;
    pending.delete(key);
    try {
      await held.entry.commit();
    } catch {
      show(held.entry.ids);
      held.entry.onFailure();
    }
    held.entry.onSettled();
  };

  leaveTarget?.addEventListener("pagehide", () => {
    pending.forEach(({ entry, timer }) => {
      clearTimeout(timer);
      entry.sendOnLeave();
    });
    pending.clear();
  });

  return {
    schedule: (entry) => {
      const key = nextKey++;
      pending.set(key, { entry, timer: setTimeout(() => void commit(key), delayMs) });
      hide(entry.ids);
      return () => {
        const held = pending.get(key);
        if (!held) return;
        clearTimeout(held.timer);
        pending.delete(key);
        show(entry.ids);
      };
    },
    getHiddenIds: () => hiddenIds,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

/** Drops the items whose ids are hidden by a pending delete. */
export const omitHidden = <T extends { id: string }>(
  items: readonly T[],
  hidden: ReadonlySet<string>,
): T[] => (hidden.size ? items.filter((item) => !hidden.has(item.id)) : [...items]);
