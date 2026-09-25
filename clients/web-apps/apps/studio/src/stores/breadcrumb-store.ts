import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Breadcrumb {
  flowId: string;
  versionId?: string;
  name: string;
  jobId?: string;
  /** Root flow version id that owns the local run's logs (carried through sub-flows). */
  runVersionId?: string;
  /** Root flow id of the local run (carried through sub-flows). */
  runFlowId?: string;
}

interface BreadcrumbState {
  trail: Breadcrumb[];
  pushBreadcrumb: (crumb: Breadcrumb) => void;
  sliceBreadcrumb: (index: number) => void;
  resetBreadcrumbs: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>()(
  persist(
    (set) => ({
      trail: [],

      pushBreadcrumb: (crumb) =>
        set((state) => {
          const lastCrumb = state.trail[state.trail.length - 1];
          const isAlreadyLast =
            lastCrumb?.flowId === crumb.flowId &&
            lastCrumb?.versionId === crumb.versionId &&
            lastCrumb?.jobId === crumb.jobId &&
            lastCrumb?.runVersionId === crumb.runVersionId &&
            lastCrumb?.runFlowId === crumb.runFlowId;

          if (isAlreadyLast) return state;
          return { trail: [...state.trail, crumb] };
        }),

      sliceBreadcrumb: (index) =>
        set((state) => ({
          trail: state.trail.slice(0, index),
        })),

      resetBreadcrumbs: () => set({ trail: [] }),
    }),
    {
      name: "flow-breadcrumb-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
