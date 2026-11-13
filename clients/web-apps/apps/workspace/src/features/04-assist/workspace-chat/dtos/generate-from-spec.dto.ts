/** Payload used to build a binary office file from a spec block, mirroring the backend GenerateFromSpecDto. */
export interface GenerateFromSpecDto {
  /** Unique identifier of the conversation this artifact belongs to. */
  conversationId: string;

  /** Fenced spec block (doc-spec, sheet-spec or slide-spec) to synthesize. */
  spec: string;
}
