import { ILLMConfiguration } from "@/features/llm-configuration/dtos/llm-configuration-dto";

interface ICategoriesDescriptor {
    id?: string;
    name: string;
    instructions: string;
}
export interface QuestionAnswersSetupDTO extends ILLMConfiguration  {
    readonly id: string;
    name: string;
    setupObject: {
        questionAnswers: ICategoriesDescriptor[]
    }
}


