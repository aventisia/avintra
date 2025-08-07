import { ILLMConfiguration } from "../components/llm-configuration/dtos/llm-configuration-dto";

interface IDocumentInstruction {
    id: string;
    filePath: string;
    name: string;
}

interface ILinks {
    id?: string;
    url: string;
}

interface ISetupObject {
    documentType: string;
    topic: string;
    industry: string;
    purposeOfArticle: string;
    toneAndStyle: string;
    targetAudience: string;
    dataAndStats: string;
    links: ILinks[];
    documents: IDocumentInstruction[] | null;
    outputLength: string;
    outputStructure: string;
}

export interface ThoughtLeadershipDTO extends ILLMConfiguration { 
    name: string;
    setupObject: ISetupObject;
}