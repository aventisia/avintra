/** Payload used to store a generated or uploaded file, mirroring the backend InsertChatArtifactDto. */
export interface InsertChatArtifactDto {
  /** Unique identifier of the conversation this artifact belongs to. */
  conversationId: string;

  /** File name shown to the user. */
  name: string;

  /** File media type. */
  contentType: string;

  /** File size in bytes. */
  sizeBytes: number;

  /** Blob storage path holding the file bytes. */
  blobPath: string;

  /** Pipeline source artifact for generated output, or null otherwise. */
  sourceArtifact: string | null;

  /** Artifact origin: Generated or Uploaded. */
  origin: "Generated" | "Uploaded";
}
