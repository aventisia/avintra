import { create } from "zustand";

import { MovableAgent } from "../types/movable-agent.type";

type AgentDragState = {
  draggedAgent: MovableAgent | null;
  setDraggedAgent: (agent: MovableAgent | null) => void;
};

/**
 * The agent being dragged, so drop targets can show that they accept it.
 */
export const useAgentDragStore = create<AgentDragState>((set) => ({
  draggedAgent: null,
  setDraggedAgent: (draggedAgent) => set({ draggedAgent }),
}));
