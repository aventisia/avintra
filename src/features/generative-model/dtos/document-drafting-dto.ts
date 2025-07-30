interface IDocumentInstruction {
    id: string;
    filePath: string;
    name: string;
}

export interface DocumentDraftingDTO{
    documentTitle: string;
    documentType: string;
    guidelines: string;
    outputStructure: string;
    localizationNeeded: string;
    documents: IDocumentInstruction[] | null;
}