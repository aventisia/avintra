interface IDocumentInstruction {
    id: string;
    filePath: string;
    name: string;
}

interface ILinks {
    id: string;
    link: string;
}

interface IThoughtLeadership { 
    documentType: string;
    topic: string;
    industry: string;
    purposeOfArticle: string;
    toneAndStyle: string;
    targetAudience: string;
    dataAndStats: string;
    links: string[];
    documents: IDocumentInstruction[] | null;
    outputLength: string;
    outputStructure: string;
}

interface ICompanyDeepDives {
    companyName: string;
    websiteLink: string;
    focusAreas: string;
    webData: string;
    links: ILinks[];
    documents: IDocumentInstruction[] | null;
    summaryDepth: string;
}

interface IPersonaResearch { 
    personaName: string;
    companyName: string;
    referenceURLs: ILinks[];
    purposeOfResearch: string;
    desiredOutputs: string;
}

interface IRfpRpiResponseGenerator {
    clientName: string;
    clientLink: string;
    rfiRfpDocuments: string;
    responseStrategy: string;
    responseBoundaries: string;
    links: ILinks[];
    referenceDocuments: IDocumentInstruction[] | null;
}

interface IDocumentDrafting{
    documentTitle: string;
    documentType: string;
    guidelines: string;
    outputStructure: string;
    localizationNeeded: string;
    documents: IDocumentInstruction[] | null;
}

export interface ModelInputDTO {
    task: string;
    thoughtLeadership: IThoughtLeadership | null;
    companyDeepDives: ICompanyDeepDives | null;
    personaResearch: IPersonaResearch | null;
    rfpRpiResponseGenerator: IRfpRpiResponseGenerator | null;
    documentDrafting: IDocumentDrafting | null;
}
