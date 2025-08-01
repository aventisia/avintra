/* eslint-disable @typescript-eslint/no-explicit-any */

import { ISelectOption } from '@aventisia/ui/types'
import { create } from 'zustand'
import { getAiPersonaLanguageList } from '../apis/ai-persona-setup-api'


type CloudLanguagesState = {
  cloudLanguages: ISelectOption[];
  loading: boolean;
  error: string | null;
  selectedLanguage: ISelectOption | null;
}

type CloudLanguagsActions = {
    fetchCloudLanguages: () => Promise<void>;
    updateSelectedLanguage: (language: ISelectOption | null) => void;
}

export const useCloudLanguagesStore = create<CloudLanguagesState & CloudLanguagsActions>((set) => ({
  cloudLanguages: [],
  loading: false,
  error: null,
  selectedLanguage: null,
  fetchCloudLanguages: async () => {
    set({ loading: true, error: null })
    try {
      const response = await getAiPersonaLanguageList();
      set({ cloudLanguages: response?.data, loading: false })
    } catch (error: any) {
      set({ error: error.toString() || 'Something went wrong', loading: false })
    }
  },
  updateSelectedLanguage: (language) => {
    set({ selectedLanguage: language })
  }
}))
