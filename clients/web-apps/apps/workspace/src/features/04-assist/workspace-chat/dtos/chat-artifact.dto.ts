/** A file stored for a landing chat conversation, mirroring the backend ChatArtifactDto. */
export interface ChatArtifactDto {
  /** Unique identifier of the artifact. */
  id: string;

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
