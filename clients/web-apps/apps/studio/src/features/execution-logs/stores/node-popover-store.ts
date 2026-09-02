// stores/useNodePopoverStore.ts
import { create } from "zustand";

interface NodePopoverState {
  openNodeId: string | null;
  anchorRect: DOMRect | null;
  isHoveringPopover: boolean;

  openPopover: (nodeId: string, rect: DOMRect) => void;
  closePopover: () => void;

  setHoveringPopover: (val: boolean) => void;
}

export const useNodePopoverStore = create<NodePopoverState>((set) => ({
  openNodeId: null,
  anchorRect: null,
  isHoveringPopover: false,

  openPopover: (nodeId, rect) =>
    set({
      openNodeId: nodeId,
      anchorRect: rect,
    }),

  closePopover: () =>
    set({
      openNodeId: null,
      anchorRect: null,
      isHoveringPopover: false,
    }),

  setHoveringPopover: (val) =>
    set({
      isHoveringPopover: val,
    }),
}));
