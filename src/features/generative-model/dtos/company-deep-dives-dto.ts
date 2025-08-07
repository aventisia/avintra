import { ILLMConfiguration } from "../components/llm-configuration/dtos/llm-configuration-dto";

interface IDocumentInstruction {
    id?: string;
    filePath: string;
    name: string;
}

interface ILinks {
    id?: string;
    url: string;
}

interface ISetupObject { 
    companyName: string;
    websiteLink: string;
    focusAreas: string;
    webData: string;
    links: ILinks[];
    documents: IDocumentInstruction[] | null;
    summaryDepth: string;
}

export interface CompanyDeepDivesDTO extends ILLMConfiguration {
    name: string;
    setupObject: ISetupObject;
}