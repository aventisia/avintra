/* eslint-disable @typescript-eslint/no-explicit-any */
interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

export interface GenerativeModelSetupDTO extends IModelInfo {
    id: string;
    name: string;
    description?: string;
    generativeModel: any;
}