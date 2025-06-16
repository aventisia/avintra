import { create } from "zustand";

interface PanelState {
  panels: Record<
    string,
    {
      isOpen: boolean;
      side: "left" | "right";
    }
  >;
  openPanel: (id: string, side: "left" | "right") => void;
  closePanel: (id: string) => void;
  isPanelOpen: (id: string) => boolean;
}

export const usePanelStore = create<PanelState>((set, get) => ({
  panels: {},

  openPanel: (id, side) => {
    set((state) => ({
      panels: {
        ...state.panels,
        [id]: {
          isOpen: true,
          side,
        },
      },
    }));
  },

  closePanel: (id) => {
    set((state) => ({
      panels: {
        ...state.panels,
        [id]: {
          ...state.panels[id],
          isOpen: false,
        },
      },
    }));
  },

  isPanelOpen: (id) => {
    return get().panels[id]?.isOpen || false;
  },
}));
