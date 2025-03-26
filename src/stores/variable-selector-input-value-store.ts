import { create } from 'zustand';

type State = {
  focusedInput: HTMLInputElement | HTMLTextAreaElement | null;  // Change from RefObject to HTMLInputElement
  selectedValue: string;
}

type Actions = {
  setSelectedValue: (value: string) => void;
  setFocusedInput: (input: HTMLInputElement | HTMLTextAreaElement | null) => void;  // Update to accept an HTMLInputElement or null
}

export const useVariableSelectorInputStore = create<State & Actions>((set) => ({
  focusedInput: null,  // Initialize with null
  selectedValue: '',
  setFocusedInput: (input) => set({ focusedInput: input }),  // Set focused input directly
  setSelectedValue: (value) => set({ selectedValue: value }),
}));
