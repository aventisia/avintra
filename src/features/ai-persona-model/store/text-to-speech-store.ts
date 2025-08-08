/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { getAiPersonaTextToSpeechServicesList } from '../apis/ai-persona-setup-api';
import { ISelectOption } from '@aventisia/ui/types';

type TtsState = {
  ttsOptions: ISelectOption[];
  loading: boolean;
  error: string | null;
  selectedTTSService: ISelectOption | null;
};

type TtsActions = {
    fetchTtsOptions: (lang: string) => Promise<void>;
    updateSelectedTTSService: (ttsService: ISelectOption | null) => void;
}


export const useTtsStore = create<TtsState & TtsActions>((set) => ({
  ttsOptions: [],
  loading: false,
  error: null,
  selectedTTSService: null,

  fetchTtsOptions: async (lang: string) => {
    set({ loading: true, error: null, selectedTTSService: null });
    try {
      const response = await getAiPersonaTextToSpeechServicesList(lang);
      set({ ttsOptions: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.toString(), loading: false });
    }
  },
  updateSelectedTTSService: (ttsService) => {
    set({ selectedTTSService: ttsService })
  }
}));
