import { ILLMConfiguration } from "../components/llm-configuration/dtos/llm-configuration-dto";

interface IDocumentInstruction {
    id?: string;
    path: string;
    name: string;
}

interface ILinks {
    id?: string;
    url: string;
}

interface ISetupObject { 
    companyName: string;
    websiteLink: string;
    focusArea: string;
    webData: string;
    links: ILinks[];
    documents: IDocumentInstruction[] | null;
    summaryDepth: string;
}

interface IGenerativeModel extends ILLMConfiguration  {
    name: string;
    setupObject: ISetupObject;
}

export interface CompanyDeepDivesDTO {
    id: string;
    generativeModel: IGenerativeModel;
}