export interface SaveAsTemplateDTO {
    id?: string;
    refId?: string;
    name: string;
    type?: string;
    description?: string;
    accessType: string;
    spaceIds?: string[];
    tags?: string[];
}