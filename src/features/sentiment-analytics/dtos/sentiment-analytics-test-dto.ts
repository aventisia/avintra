interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

// Level 3
export interface ISubSubCategoryDescriptor {
    id?: string;
    name: string;
    value: string;
}
  
// Level 2
  export interface ISubCategoryDescriptor {
    id?: string;
    name: string;
    value: string;
    subSubCategories?: ISubSubCategoryDescriptor[]; // optional, can default to []
}

interface IExtractedData {
    name: string;
    value: string;
    subCategories?: ISubCategoryDescriptor[]; // optional, can default to []
    
}

export interface SentimentAnalyticsTestDTO extends IModelInfo {
    id: string;
    mlModelId: string;
    docId: string;
    docName: string;
    accuracy: number;
    type: string;
    submitForFineTuning: boolean;
    extractedData: IExtractedData[]
}