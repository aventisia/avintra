import { ILLMConfiguration } from "@/features/llm-configuration/dtos/llm-configuration-dto";

// Level 3
export interface ISubSubCategoryDescriptor {
  id?: string;
  name: string;
  instructions?: string;
}

// Level 2
export interface ISubCategoryDescriptor {
  id?: string;
  name: string;
  instructions?: string;
  subSubCategories?: ISubSubCategoryDescriptor[]; // optional, can default to []
}

// Level 1 (main category)
export interface ICategoriesDescriptor {
  id?: string;
  name: string;
  instructions?: string;
  subCategories?: ISubCategoryDescriptor[]; // optional, can default to []
}

// Final DTO
export interface ClassficationModelSetupDTO extends ILLMConfiguration {
  readonly id: string;
  name: string;
  setupObject: {
    allowMultipleClasses: boolean;
    categories: ICategoriesDescriptor[]; // optional, can default to []
  };
}
