import { ILLMConfiguration } from "@/features/llm-configuration/dtos/llm-configuration-dto";

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

export interface InformationExtractorSetupDTO extends ILLMConfiguration {
   readonly id: string;
   name: string;
   setupObject: {
    tables: ITableMetaData[],
    fields: IFieldSetups[]
   }
}