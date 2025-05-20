import { enumToArray } from "@/react-toolkit/utils/enum-to-array";
import { create } from "zustand";
import { DefaultModelsLibraryEnums } from "../enums/default-models-";
import { CustomModelLibraryEnums } from "../enums/custom-models";

type Models = {
    label: string,
    value: string,
}

type State = {
    // Default models present
    defaultModels: Models[];

    // Custom models
    customModels: Models[];

    // default model to show
    defaultModelToShow: boolean;

    // Is Select Model Popover open or close
    isSelectModelPopoverOpen: boolean;

    // Show add model dropdown container
    showAddModelDropdownContainer: boolean,
}

type Actions = {
    // Function to toggle whether to show default models or custom models.
    setDefaultModelToShow: (modelToShow: boolean) => void;

    // Function to open/close Select model popover
    setIsModelPopoverOpen: (popoverState: boolean) => void;

    // Toggle show add model drpodown container
    setShowAddModelDropdownContainer: (containerState: boolean) => void;
}

export const useAddModelStore = create<State & Actions>((set) => ({
    defaultModels: enumToArray(DefaultModelsLibraryEnums),
    customModels: enumToArray(CustomModelLibraryEnums),
    defaultModelToShow: true,
    isSelectModelPopoverOpen: false,
    showAddModelDropdownContainer: false,
  
    setDefaultModelToShow: (modelToShow) =>
      set(() => ({ defaultModelToShow: modelToShow })),
  
    setIsModelPopoverOpen: (popoverState) =>
      set(() => ({ isSelectModelPopoverOpen: popoverState })),

    setShowAddModelDropdownContainer: (containerState) =>  
        set(() => ({ showAddModelDropdownContainer: containerState })),
  }));
  