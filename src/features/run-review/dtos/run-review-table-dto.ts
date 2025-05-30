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

export interface RunReviewTableDTO extends IRecordInfo {
    id: string;
    mlModelId: string;
    docId: string;
    docName: string;
    status: string;
    accuracy: number;
    columns: IColumns[]
    type: string;
    submitForFineTuning: boolean;
}