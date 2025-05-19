
interface ITableMetaDataHeaders {
    id?: string,
    name?: string,
    values?: string[]
};

interface IFieldSetups {
    id?: string;
    name?: string,
    value?:  string,
    accuracy?: number,
};

interface ITableMetaData {
    id?: string;
    name: string;
    tableHeaders: ITableMetaDataHeaders[];
}

interface ISetupObject {
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

export interface InformationExtractorTestDTO extends IModelInfo {
    id: string;
    setupObject: ISetupObject;
}