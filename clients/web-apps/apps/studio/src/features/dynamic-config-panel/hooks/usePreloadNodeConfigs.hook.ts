import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { preloadNodeConfigs } from "../apis/get-node-config.apis";

/**
 * Preloads all local node configs in the background once the flow finishes loading.
 */
export const usePreloadNodeConfigs = () => {
  const { isFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      isFlowLoading: state.isFlowLoading,
    })),
  );

  useEffect(() => {
    if (isFlowLoading) return;
    // IMPORTANT NOTE: on a cold start the render-time flag still shows the initial false while child effects already flip it true; read the live store so the preload never starts during hydration.
    if (useCurrentFlowStore.getState().isFlowLoading) return;

    const start = () => {
      if (useCurrentFlowStore.getState().isFlowLoading) return;
      void preloadNodeConfigs();
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = window.setTimeout(start, 1000);
    return () => window.clearTimeout(timerId);
  }, [isFlowLoading]);
};
