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
    llm: string;
    temperature: number;
    enableAudio: boolean;
    enableVideo: boolean;
    enableChat: boolean;
}

interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

export interface AiPersonaSetupDTO extends IModelInfo {
    id: string;
    setupObject: ISetupObject;
}