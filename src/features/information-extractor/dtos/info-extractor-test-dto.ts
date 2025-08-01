interface IFields {
    name: string;
    value: string;
    confidenceScore: string;
}

interface ITablesHeaders {
    index?: string;
    name: string;
    values: string[]
}

export interface ITables {
    name: string;
    headers: ITablesHeaders[]
}

export interface InfoExtractorTestDTO  {
    fields: IFields[];
    tables: ITables[] | null;
}