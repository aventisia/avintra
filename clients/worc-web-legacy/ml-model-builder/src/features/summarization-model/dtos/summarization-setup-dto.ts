import { ILLMConfiguration } from "@/features/llm-configuration/dtos/llm-configuration-dto";

export interface SummarizationSetupDTO extends ILLMConfiguration {
  readonly id: string;
  name: string;
  setupObject: {
    totalMinimumWords: number;
    totalMaximumWords: number;
    readonly summarizationMethod: string;
  };
}
