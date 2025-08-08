import { ILLMConfiguration } from "../components/llm-configuration/dtos/llm-configuration-dto";

interface IDocumentInstruction {
    id: string;
    path: string;
    name: string;
}

interface ISetupObject { 
    documentTitle: string;
    documentType: string;
    guidelineInstruction: string;
    outputStructure: string;
    localizationNeeded: string;
    preferenceDocuments: IDocumentInstruction[] | null;
}

interface IGenerativeModel extends ILLMConfiguration  {
    name: string;
    setupObject: ISetupObject;
}

export interface DocumentDraftingDTO {
    id: string;
    generativeModel: IGenerativeModel;
}