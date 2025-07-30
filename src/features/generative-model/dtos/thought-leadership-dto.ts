interface IDocumentInstruction {
    id: string;
    filePath: string;
    name: string;
}

interface ILinks {
    id: string;
    link: string;
}

export interface ThoughtLeadershipDTO { 
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