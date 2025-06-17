interface ICategoriesDescriptor {
    id?: string;
    name: string;
    instructions: string;
}

interface ISetupObject {
    context: string;
    prompt: string;
    questionAnswers: ICategoriesDescriptor[]
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

export interface QuestionAnswersSetupDTO extends IModelInfo {
    id: string;
    setupObject: ISetupObject;
}