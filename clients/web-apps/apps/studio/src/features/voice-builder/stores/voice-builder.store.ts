import { create } from "zustand";

import type { VoiceBuilderSectionId, VoiceReadinessCheck } from "../types/voice-builder.type";

type VoiceBuilderState = {
  activeSection: VoiceBuilderSectionId;
  /** Required steps the open settings form still fails; null while no form is open. */
  pendingChecks: VoiceReadinessCheck[] | null;
  /** Increments on every settings edit so views can drop results from older settings. */
  configRevision: number;
  setActiveSection: (section: VoiceBuilderSectionId) => void;
  setPendingChecks: (checks: VoiceReadinessCheck[]) => void;
  bumpConfigRevision: () => void;
  reset: () => void;
};

const INITIAL_STATE = {
  activeSection: "prompt",
  pendingChecks: null,
  configRevision: 0,
} satisfies Pick<VoiceBuilderState, "activeSection" | "pendingChecks" | "configRevision">;

export const useVoiceBuilderStore = create<VoiceBuilderState>((set) => ({
  ...INITIAL_STATE,
  setActiveSection: (activeSection) => set({ activeSection }),
  setPendingChecks: (pendingChecks) => set({ pendingChecks }),
  bumpConfigRevision: () => set((state) => ({ configRevision: state.configRevision + 1 })),
  reset: () => set(INITIAL_STATE),
}));
