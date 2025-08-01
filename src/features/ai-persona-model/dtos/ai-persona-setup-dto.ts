import { ILLMConfiguration } from "@/features/llm-configuration/dtos/llm-configuration-dto";

interface IDocumentInstruction {
    id: string;
    filePath: string;
    name: string;
    instructions: string;
}

interface ISetupObject {
    name: string;
    roleOrObjective: string;
    categoryOrDomain: string;
    toneOfVoice: string;
    instructions: string;
    exclusionsOrBoundaries: string;
    documents: IDocumentInstruction[] | null;
    contextMemoryTimeframe: string;
    speechConfiguration: {
        configurationType: "OnPrem" | "Cloud";
        language: string;
        voice: string;
        textToSpeech: string;
        speechToText: string;
    }
}

interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

interface IConversationModel extends ILLMConfiguration {
    name: string;
    setupObject: ISetupObject;
}

export interface AiPersonaSetupDTO extends IModelInfo {
    id: string;
    aiPersona: IConversationModel
}