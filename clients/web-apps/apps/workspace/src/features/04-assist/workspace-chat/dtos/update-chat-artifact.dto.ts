/** Payload used to rename a chat artifact with all of its versions, mirroring the backend UpdateChatArtifactDto. */
export interface UpdateChatArtifactDto {
  /** Unique identifier of any version of the artifact. */
  id: string;

  /** New file name, keeping the current extension (max 255 characters). */
  name: string;
}
