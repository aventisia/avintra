interface IDocumentInstruction {
    id: string;
    filePath: string;
    name: string;
}

interface ILinks {
    id: string;
    link: string;
}


export interface CompanyDeepDivesDTO {
    companyName: string;
    websiteLink: string;
    focusAreas: string;
    webData: string;
    links: ILinks[];
    documents: IDocumentInstruction[] | null;
    summaryDepth: string;
}