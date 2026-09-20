import { useEffect, useRef } from "react";

import { useDynamicConfigPanelStore } from "../stores/dcp-store";
import type { FlushFormFn } from "./useFlushNodeConfig";

/** Registers the active config form's flush with the DCP store. */
export const useRegisterFormFlush = (flush: FlushFormFn) => {
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => {
    useDynamicConfigPanelStore.getState().setFlushForm(() => flushRef.current());
    return () => {
      useDynamicConfigPanelStore.getState().setFlushForm(undefined);
    };
  }, []);
};

/**
 * Registers a composite field's pending-edit commit with the DCP store. The
 * callback returns true when it committed something (so a flush triggered only
 * by builder edits still snapshots the form).
 */
export const useRegisterPendingFieldFlush = (flush: () => boolean) => {
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => {
    useDynamicConfigPanelStore.getState().setFlushPendingFieldEdits(() => flushRef.current());
    return () => {
      useDynamicConfigPanelStore.getState().setFlushPendingFieldEdits(undefined);
    };
  }, []);
};
