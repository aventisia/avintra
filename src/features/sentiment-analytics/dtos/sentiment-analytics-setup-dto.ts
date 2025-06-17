interface IFieldDescriptor {
    id?: string;
    name: string;
    instructions: string;
}

interface ISetupObject {
    context: string;
    prompt: string;
    categories: IFieldDescriptor[];
    llm: string;
    temperature: number;
}

interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

export interface SentimentAnalyticsSetupDTO extends IModelInfo {
    id: string;
    setupObject: ISetupObject;
}