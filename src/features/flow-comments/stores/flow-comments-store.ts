import { create } from "zustand";

type State = {
  /** flow id for flow comments */
  flowId: string;

  /** Query key for flow comments (fc = flowComments) */
  fcQueryKey: string[];

  /** To manage flow-comments popover open/close state */
  isPopoverOpen: boolean;

  /** flow comment Id (record id) */
  flowCommentId: string;
};

type Actions = {
  /** Set flow-comments query key and flow Id */
  setFCQueryKey: (flowId: string) => void;

  /** To toggle flow-comments popover open/close state */
  togglePopoverOpen: (value?: boolean) => void;

  /** To set flow comment id */
  setFlowCommentId: (flowCommentId: string) => void;
};

export const useFlowCommentsStore = create<State & Actions>((set) => ({
  flowId: "",
  fcQueryKey: [],
  isPopoverOpen: false,
  flowCommentId: window.crypto.randomUUID(),

  setFCQueryKey: (flowId) =>
    set(() => ({
      fcQueryKey: ["flow-comments", flowId],
      flowId: flowId,
    })),

  togglePopoverOpen: (value) =>
    set((state) => ({
      isPopoverOpen: typeof value === "boolean" ? value : !state.isPopoverOpen,
    })),

  setFlowCommentId: (flowCommentId) => set({ flowCommentId }),
}));
