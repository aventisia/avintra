import { ILLMConfiguration } from "../components/llm-configuration/dtos/llm-configuration-dto";

interface ILinks {
    id?: string;
    url: string;
}

interface ISetupObject { 
    personaName: string;
    companyName: string;
    links: ILinks[];
    purposeOfResearch: string;
    desiredOutput: string;
}

export interface PersonaResearchDTO extends ILLMConfiguration { 
    name: string;
    setupObject: ISetupObject;
}
