import { ILLMConfiguration } from "../components/llm-configuration/dtos/llm-configuration-dto";

interface IDocumentInstruction {
    id: string;
    filePath: string;
    name: string;
}

interface ISetupObject { 
    documentTitle: string;
    documentType: string;
    guidelines: string;
    outputStructure: string;
    localizationNeeded: string;
    documents: IDocumentInstruction[] | null;
}

export interface DocumentDraftingDTO extends ILLMConfiguration{
    name: string;
    setupObject: ISetupObject;
}