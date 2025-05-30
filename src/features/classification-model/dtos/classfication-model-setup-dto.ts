interface ICategoriesDescriptor {
    id?: string;
    name: string;
    instructions: string;
}

interface ISetupObject {
    context: string;
    prompt: string;
    allowMultipleClasses: boolean,
    categories: ICategoriesDescriptor[]
}

interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

export interface ClassficationModelSetupDTO extends IModelInfo {
    id: string;
    setupObject: ISetupObject;
}