interface IDocumentInstruction {
    id: string;
    filePath: string;
    name: string;
}

interface ILinks {
    id: string;
    link: string;
}

export interface RfpRpiResponseGeneratorDTO {
    clientName: string;
    clientLink: string;
    rfiRfpDocuments: IDocumentInstruction[] | null;
    responseStrategy: string;
    responseBoundaries: string;
    links: ILinks[];
    referenceDocuments: IDocumentInstruction[] | null;
}