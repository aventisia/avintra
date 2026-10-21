import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { VectorStoreEnum } from "../enums/vector-store-enum";

/**
 * Represents a data transfer object (DTO) for a KnowledgeBase
 */
export interface KnowledgeBaseTableDto {
  id?: string;

  /**
   * Name of the Knowledge Base (max 255 chars).
   */
  name: string;

  /**
   * Description of the Knowledge Base.
   */
  description?: string;

  /**
   * Type of vector store used for this Knowledge Base.
   * Should match backend VectorStoreEnum values.
   */
  vectorStore: VectorStoreEnum;

  /**
   * Embedding provider used for vectorizing content (max 255 chars).
   */
  embeddingProvider: string;

  /**
   * Embedding model name used for vectorizing content (max 255 chars).
   */
  embeddingModel: string;

  /**
   * Credential ID used for the embedding model provider.
   */
  embeddingCredentialId?: string;

  /**
   * Name of the credential used for the embedding model provider.
   * The Agent Builder stores and submits the resource NAME; the backend resolves
   * it to the embeddingCredentialId before persisting.
   */
  embeddingCredentialName?: string;

  /**
   * Credential ID used for the vector store.
   */
  storeCredentialId?: string;

  /**
   * Name of the credential used for the vector store.
   * The Agent Builder stores and submits the resource NAME; the backend resolves
   * it to the storeCredentialId before persisting.
   */
  storeCredentialName?: string;

  /**
   * Name of the collection/index in the vector store.
   */
  collectionName?: string;

  /**
   * Dynamic JSON configuration for the external vector store.
   */
  vectorStoreConfig?: string;

  /**
   * Access level of the configuration item.
   */
  accessLevel: ResourceAccessTypeEnum;

  /**
   * Indicates whether the kb is accessible
   * to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Indicates whether flow access to the knowledge base is restricted to the assigned flows.
   */
  isResourceAccessRestricted: boolean;

  /**
   * Flag indicating whether the Knowledge Base record is disabled.
   */
  isDisabled?: boolean;

  /**
   * Username of the user who created the Knowledge Base record.
   */
  createdBy?: string;

  /**
   * Date and time when the Knowledge Base record was created.
   */
  createdOn?: string;

  /**
   * Username of the user who last modified the Knowledge Base record.
   */
  lastModifiedBy?: string;

  /**
   * Date and time when the Knowledge Base record was last modified.
   */
  lastModifiedOn?: string;

  /**
   * Total number of chunks across all files in this Knowledge Base.
   */
  totalChunks?: number;
}
