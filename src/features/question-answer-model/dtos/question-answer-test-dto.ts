interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}


interface IExtractedData {
    question: string;
    answer: string;
}

export interface QuestionAnswersTestDTO extends IModelInfo {
    id: string;
    mlModelId: string;
    docId: string;
    docName: string;
    accuracy: number;
    type: string;
    submitForFineTuning: boolean;
    extractedData: IExtractedData[]
}