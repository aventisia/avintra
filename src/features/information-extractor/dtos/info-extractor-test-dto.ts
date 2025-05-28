interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

interface IFields {
    name: string;
    value: string;
    confidenceScore: string;
}

interface ITablesHeaders {
    name: string;
    values: string[]
}

interface ITables {
    name: string;
    headers: ITablesHeaders[]
}

interface IExtractedData {
    fields: IFields[];
    tables: ITables[] ;
}

export interface InfoExtractorTestDTO extends IModelInfo {
    id: string;
    mlModelId: string;
    docId: string;
    docName: string;
    accuracy: number;
    type: string;
    submitForFineTuning: boolean;
    extractedData: IExtractedData
}