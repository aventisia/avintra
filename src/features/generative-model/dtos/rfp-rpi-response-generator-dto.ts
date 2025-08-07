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
    clientName: string;
    clientLink: string;
    rfiRfpDocuments: IDocumentInstruction[] | null;
    responseStrategy: string;
    responseBoundaries: string;
    links: ILinks[];
    referenceDocuments: IDocumentInstruction[] | null;
}

export interface RfpRpiResponseGeneratorDTO  extends ILLMConfiguration{
    name: string;
    setupObject: ISetupObject;

}