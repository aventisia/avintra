import { create } from "zustand";

type State = {
  inputName: string; // input ID to identify which input is focused
  focusedInput: HTMLInputElement | HTMLTextAreaElement | null;
  selectedValue: string;
  isOpen: boolean;
};

type Actions = {
  setInputName: (inputName: string) => void;
  setSelectedValue: (value: string) => void;
  setFocusedInput: (input: HTMLInputElement | HTMLTextAreaElement | null) => void;
  /** To toggle popover open/close state */
  setOpenState: (isOpen: boolean) => void;
};

export const useVariableSelectorStore = create<State & Actions>((set) => ({
  inputName: "",
  focusedInput: null, // Initialize with null
  selectedValue: "",
  isOpen: false,

  setInputName: (inputName) => set({ inputName }),
  setFocusedInput: (input) => set({ focusedInput: input }), // Set focused input directly
  setSelectedValue: (value) => set({ selectedValue: value }),
  setOpenState: (value) => set({ isOpen: value }),
}));
