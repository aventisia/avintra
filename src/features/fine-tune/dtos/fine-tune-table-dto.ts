interface IRecordInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

interface IColumns {
    name: string;
    value: string | null;
}

export interface FineTuneTableDTO extends IRecordInfo {
    id: string;
    mlModelId: string;
    docId: string;
    docName: string;
    status: string;
    accuracy: number;
    columns: IColumns[]
    type: string;
    submitForFineTuning: boolean;
    fineTunedOn: Date | null;
    duration: number | null;
}