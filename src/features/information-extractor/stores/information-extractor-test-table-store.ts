import { create } from "zustand";

type State = {
    // Active Tab
    activeTab: string | undefined;
}

type Actions = {
    // Set Active Tab
    setActiveTab: (newTabValue: string | undefined) => void; 
    
}

export const useInformationExtractorTestTableStore = create<State & Actions>((set) => ({
    activeTab: "Table 1",

    setActiveTab: (newTabValue) => set(() => ({activeTab: newTabValue})),
}));
