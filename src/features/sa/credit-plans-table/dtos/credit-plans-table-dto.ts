interface IModelInfo {
  createdOn?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: string;
}

/**
 * Represents a data transfer object (DTO) for a model.
 */
export interface CreditPlansTableDto extends IModelInfo {
  /**
   * Gets or sets the primary key of the model record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the type of the service.
   */
  serviceType: string;

  /**
   * Gets or sets the unitType.
   */
  unitType: string;

  /**
   * Gets or sets the oneUnit
   */
  oneUnit: number;

  /**
   * Gets or sets the number of credits.
   */
  credits: number;

  /**
   * Is the record disbaled
   */
  isDisabled?: boolean;
}
