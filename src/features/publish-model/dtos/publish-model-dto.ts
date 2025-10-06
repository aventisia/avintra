/**
 * Represents a data transfer object (DTO) for publish ai model.
 */
export interface PublishModelDto {
    /**
     * Gets or sets the primary key of the model record.
     *
     * Not making it required because same DTO is used for insert and update.
     */
    id: string;
  
    aiProjectId:string;
 }
  