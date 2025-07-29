import { ILLMConfiguration } from "@/features/llm-configuration/dtos/llm-configuration-dto";

export interface ISubSubCategoryDescriptor {
    id?: string;
    name: string;
    instructions?: string;
}

export interface ISubCategoryDescriptor {
  id?: string;
  name: string;
  instructions?: string;
  subSubCategories?: ISubSubCategoryDescriptor[]; // optional, can default to []
}

interface IFieldDescriptor {
    id?: string;
    name: string;
    instructions: string;
    subCategories?: ISubCategoryDescriptor[];
}

export interface SentimentAnalyticsSetupDTO extends ILLMConfiguration  {
    readonly id: string;
    name: string;
    setupObject: {
        categories: IFieldDescriptor[];
    }
}

