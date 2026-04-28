// stores/useNodePopoverStore.ts
import { NodeDataType } from "@/types/node-data-type";

import { create } from "zustand";

interface NodePopoverState {
  openNodeId: string | null;
  nodeData: NodeDataType | null;
  anchorRect: DOMRect | null;
  isHoveringPopover: boolean;

  openPopover: (nodeId: string, data: NodeDataType, rect: DOMRect) => void;
  closePopover: () => void;

  setHoveringPopover: (val: boolean) => void;
}

export const useNodePopoverStore = create<NodePopoverState>((set) => ({
  openNodeId: null,
  nodeData: null,
  anchorRect: null,
  isHoveringPopover: false,

  openPopover: (nodeId, data, rect) =>
    set({
      openNodeId: nodeId,
      nodeData: data,
      anchorRect: rect,
    }),

  closePopover: () =>
    set({
      openNodeId: null,
      nodeData: null,
      anchorRect: null,
      isHoveringPopover: false,
    }),

  setHoveringPopover: (val) =>
    set({
      isHoveringPopover: val,
    }),
}));
