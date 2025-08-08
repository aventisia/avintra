/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import { getAiPersonaSpeechToTextServicesList } from '../apis/ai-persona-setup-api';
import { ISelectOption } from '@aventisia/ui/types';

type SttState = {
  sttOptions: ISelectOption[];
  loading: boolean;
  error: string | null;
  selectedSTTService: ISelectOption | null;

};

type SttActions = {
    fetchSttOptions: (lang: string) => Promise<void>;
    updateSelectedSTTService: (sttService: ISelectOption | null) => void;

}

export const useSttStore = create<SttState & SttActions>((set) => ({
  sttOptions: [],
  loading: false,
  error: null,
  selectedSTTService: null,

  fetchSttOptions: async (lang: string) => {
    set({ loading: true, error: null, selectedSTTService: null });
    try {
      const response = await getAiPersonaSpeechToTextServicesList(lang);
      set({ sttOptions: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.toString(), loading: false });
    }
  },

  updateSelectedSTTService: (sttService) => {
    set({ selectedSTTService: sttService })
  }
}));
