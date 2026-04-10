/**
 * Represents a data transfer object (DTO) for a KnowledgeBase
 */
export interface KnowledgeBaseTableDto {
  /**
   * Gets or sets the primary key of the KnowledgeBase record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the name of the KnowledgeBase Max-255
   */
  name: string;

  /**
   * Gets or sets the description of the KnowledgeBase
   */
  description: string;
  kb: {
    is_byok_enabled: boolean;
    credential_id?: string;
    provider: string;
    model: string;
  };
  /**
   * Gets or sets the vectorStore of the KnowledgeBase
   */
  vectorStore: string;

  /**
   * Gets or sets the embeddingModel of the KnowledgeBase
   */
  embeddingModel: string;

  /**
   * Gets or sets a flag indicating whether the KnowledgeBase record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true, false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the KnowledgeBase record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the KnowledgeBase record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the KnowledgeBase record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the KnowledgeBase record was last modified.
   */
  lastModifiedOn?: Date;
}
