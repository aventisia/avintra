import { KnowledgeBaseTableDto } from "../dtos/knowledge-base-table-dto";

/**
 * Error text when the knowledge base has a saved embedding credential that no longer resolves to a name, otherwise null.
 */
export const getEmbeddingCredentialGuardError = (
  knowledgeBase: KnowledgeBaseTableDto,
): string | null => {
  if (!knowledgeBase.embeddingCredentialId || knowledgeBase.embeddingCredentialName?.trim()) {
    return null;
  }

  return `The embedding credential saved for this knowledge base (${knowledgeBase.embeddingCredentialId}) is no longer available. Edit the knowledge base and select a valid credential.`;
};

/**
 * Throws the guard error when the saved embedding credential no longer resolves to a name.
 */
export const assertEmbeddingCredentialAvailable = (knowledgeBase: KnowledgeBaseTableDto): void => {
  const error = getEmbeddingCredentialGuardError(knowledgeBase);

  if (error) {
    throw new Error(error);
  }
};

/**
 * Credential ID to submit on save: an unresolvable ID is kept unless the user clears a previously valid name or picks a new one.
 */
export const resolveEmbeddingCredentialIdForSave = (
  credentialName: string,
  savedCredential: { name: string; id?: string },
): string | undefined => {
  if (credentialName || savedCredential.name) {
    return undefined;
  }

  return savedCredential.id;
};
