interface ILinks {
    id: string;
    link: string;
}

export interface PersonaResearchDTO { 
    personaName: string;
    companyName: string;
    referenceURLs: ILinks[];
    purposeOfResearch: string;
    desiredOutputs: string;
}
