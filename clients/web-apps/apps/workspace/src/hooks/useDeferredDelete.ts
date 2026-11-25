import { type AxiosRequestConfig } from "axios";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";

import { createDeferredDeleteQueue } from "@/utils/deferred-delete-queue.util";
import { KEEPALIVE_REQUEST } from "@/utils/keepalive-request.util";

const UNDO_WINDOW_MS = 8000;

const queue = createDeferredDeleteQueue({ delayMs: UNDO_WINDOW_MS, leaveTarget: window });
let nextToastId = 0;

/** A delete to hold back behind an Undo toast. */
export type DeleteWithUndo = {
  ids: readonly string[];
  message: string;
  failureMessage: string;
  commit: (config?: AxiosRequestConfig) => Promise<unknown>;
  onSettled: () => void;
};

/** Hides the items at once and shows an Undo toast; the delete is sent when the toast ends or the page closes. */
export const deleteWithUndo = ({
  ids,
  message,
  failureMessage,
  commit,
  onSettled,
}: DeleteWithUndo) => {
  const toastId = `deferred-delete-${nextToastId++}`;
  const undo = queue.schedule({
    ids,
    // IMPORTANT NOTE: sonner pauses a hovered toast, so Undo must close here or it would outlive the delete.
    commit: () => {
      toast.dismiss(toastId);
      return commit();
    },
    // IMPORTANT NOTE: browsers cancel ordinary requests when the page unloads; only a keepalive request survives.
    sendOnLeave: () => {
      toast.dismiss(toastId);
      void commit(KEEPALIVE_REQUEST).catch(() => undefined);
    },
    onFailure: () => toast.error(failureMessage),
    onSettled,
  });
  toast.success(message, {
    id: toastId,
    duration: UNDO_WINDOW_MS,
    className: "sonner-toaster-sm",
    action: { label: "Undo", onClick: undo },
  });
};

/** Ids of items whose delete is pending or done, for lists to leave out. */
export const useHiddenDeleteIds = () => useSyncExternalStore(queue.subscribe, queue.getHiddenIds);
