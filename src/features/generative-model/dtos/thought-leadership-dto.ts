import { ILLMConfiguration } from "../components/llm-configuration/dtos/llm-configuration-dto";

interface IDocumentInstruction {
    id: string;
    path: string;
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
    purpose: string;
    toneStyle: string;
    audienceTarget: string;
    dataAndStats: string;
    links: ILinks[];
    documents: IDocumentInstruction[] | null;
    contentLength: string;
    contentStructure: string;
}

interface IGenerativeModel extends ILLMConfiguration  {
    name: string;
    setupObject: ISetupObject;
}


export interface ThoughtLeadershipDTO { 
    id: string;
    generativeModel: IGenerativeModel;
}