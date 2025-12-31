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
  clientName: string;
  websiteLink: string;
  rpfDocument: IDocumentInstruction[] | null;
  responseStrategy: string;
  responseBoundary: string;
  links: ILinks[];
  preferDocument: IDocumentInstruction[] | null;
}

interface IGenerativeModel extends ILLMConfiguration {
  name: string;
  setupObject: ISetupObject;
}

export interface RfpRpiResponseGeneratorDTO {
  id: string;
  generativeModel: IGenerativeModel;
}
