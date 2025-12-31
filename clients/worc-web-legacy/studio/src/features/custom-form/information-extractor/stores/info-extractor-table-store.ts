import { create } from "zustand";

type State = {
    // Active Tab
    activeTab: string | undefined;

    // Alert Dialog
    showDeleteTableAlertDialog: boolean;

    // Table to delete index
    tableToDeleteIndex: number | null;

    // Tablename to Edit Index
    tableToEditNameIndex: number | null;
}

type Actions = {
    // Set Active Tab
    setActiveTab: (newTabValue: string | undefined) => void; 

    // set show Alert Dialog
    setShowDeleteTableAlertDialog: (dialogState: boolean) => void;

    // Set Table to delete idx
    setTableToDeleteIdx: (idx: number | null) => void;

    // set table name to edit using idx
    setTableToEditNameIndex: (idx: number | null) => void;
    
}

export const useInformationExtractorTableStore = create<State & Actions>((set) => ({
    activeTab: "Table 1",
    showDeleteTableAlertDialog: false,
    tableToDeleteIndex: null,
    tableToEditNameIndex: null,

    setActiveTab: (newTabValue) => set(() => ({activeTab: newTabValue})),

    setShowDeleteTableAlertDialog: (dialogState) => set(() => ({showDeleteTableAlertDialog: dialogState})),

    setTableToDeleteIdx: (idx) => set(() => ({tableToDeleteIndex: idx})),

    setTableToEditNameIndex: (idx) => set(() => ({tableToEditNameIndex: idx})),
}));
