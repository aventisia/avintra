/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISelectOption } from "@aventisia/ui/types";
import { create } from "zustand";

import { getAiPersonaVoicesList } from "../apis/ai-persona-setup-api";

type VoicesState = {
  voicesOptions: ISelectOption[];
  loading: boolean;
  error: string | null;
  selectedVoice: ISelectOption | null;
};

type VoicesActions = {
  fetchVoiceOptions: (ttsService: string) => Promise<void>;
  updateSelectedVoice: (voice: ISelectOption | null) => void;
  setVoicesOptions: (options: ISelectOption[]) => void;
};

export const useVoiceStore = create<VoicesState & VoicesActions>((set) => ({
  voicesOptions: [],
  loading: false,
  error: null,
  selectedVoice: null,

  fetchVoiceOptions: async (ttsService: string) => {
    set({ loading: true, error: null, selectedVoice: null });
    try {
      const response = await getAiPersonaVoicesList(ttsService);
      set({ voicesOptions: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.toString(), loading: false });
    }
  },
  updateSelectedVoice: (voice) => {
    set({ selectedVoice: voice });
  },
  setVoicesOptions: (options) => {
    set({ voicesOptions: options });
  },
}));
