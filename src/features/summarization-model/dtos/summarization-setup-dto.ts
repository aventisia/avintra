interface ISetupObject {
    context: string;
    // prompt: string;
    // charactersPerChunk: number;
    // chunkOverlap: number;
    totalMinimumWords: number;
    totalMaximumWords: number;
    summarizationMethod: string;
    // mapIndividualSummaryPrompt: string | null;
    // mapFinalCombinePrompt: string | null;
    // refineInitialPrompt: string | null;
    // refineSubsequentPrompt: string | null;
    stuffPrompt: string;
}

interface IModelInfo {
    createdOn?: string;
    createdByUserId?: string;
    lastModifiedByUserId?: string;
    createdBy?: string;
    createdByUsername?: string;
}

export interface SummarizationSetupDTO extends IModelInfo {
    id: string;
    setupObject: ISetupObject;
}