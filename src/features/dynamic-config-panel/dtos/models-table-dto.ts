/**
 * Represents a data transfer object (DTO) for a model.
 */
export interface ModelsListDto {
  /**
   * Gets or sets the primary key of the model record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the type of the model.
   */
  type: string; // TODO: Update enum values

  /**
   * Gets or sets the llm of the model.
   */
  llm: string; // TODO: Update enum values

  /**
   * Gets or sets the name of the model. Max-255
   */
  name: string;

  /**
   * Gets or sets the description of the model.
   */
  description?: string;
}
