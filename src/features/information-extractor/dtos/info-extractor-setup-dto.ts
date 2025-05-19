interface IFieldDescriptor {
    id?: string;
    name: string;
    type: string;
    instructions: string;
}

type ITableMetaDataHeaders = IFieldDescriptor;
type IFieldSetups = IFieldDescriptor;

interface ITableMetaData {
    id?: string;
    context: string;
    name: string;
    tableHeaders: ITableMetaDataHeaders[];
}

interface ISetupObject {
    context: string;
    prompt: string;
    tableMetadata: ITableMetaData[] | null,
    fieldSetups: IFieldSetups[];


}
interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

export interface InformationExtractorSetupDTO extends IModelInfo {
    id: string;
    setupObject: ISetupObject;
}